// Streaming Nova coach chat.
// - Loads founder profile + active project + latest summary + last 8 unsummarized turns
// - Streams via AI SDK
// - Persists user + assistant UI messages in onFinish with parts + metadata
// - Chat itself is free (no credit debit); costly agent tasks live in separate functions
import { createClient } from "npm:@supabase/supabase-js@2";
import { convertToModelMessages, streamText, type UIMessage } from "npm:ai";
import { createNovaGateway, getLovableAiGatewayRunId } from "../_shared/novaGateway.ts";
import { NOVA_MODELS } from "../_shared/novaModels.ts";
import { NOVA_SYSTEM_PROMPT } from "../_shared/novaPrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

interface ReqBody {
  messages: UIMessage[];
  conversationId: string;
  projectId?: string | null;
  agent_type?: string;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json(401, { error: "unauthenticated" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) return json(401, { error: "unauthenticated" });
    const userId = userRes.user.id;

    const body = (await req.json()) as ReqBody;
    if (!body?.conversationId || !Array.isArray(body?.messages)) {
      return json(400, { error: "invalid_body" });
    }
    const agentType = body.agent_type ?? "nova_manager";

    // Verify conversation ownership (RLS also enforces, but we want a clean 403)
    const { data: conv, error: convErr } = await supabase
      .from("nova_conversations")
      .select("id,user_id,project_id")
      .eq("id", body.conversationId)
      .maybeSingle();
    if (convErr || !conv || conv.user_id !== userId) {
      return json(403, { error: "conversation_forbidden" });
    }

    // Load context: founder profile + project + latest summary + active turns
    const [profileRes, summaryRes, memoriesRes] = await Promise.all([
      supabase.from("founder_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("nova_memories")
        .select("content, created_at")
        .eq("user_id", userId)
        .eq("memory_type", "summary")
        .eq("project_id", conv.project_id ?? null as unknown as string)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("nova_memories")
        .select("memory_type, content, importance")
        .eq("user_id", userId)
        .in("memory_type", ["decision", "preference", "open_question", "coach_note"])
        .order("importance", { ascending: false })
        .limit(8),
    ]);

    const profile = profileRes.data;
    const summary = summaryRes.data?.[0]?.content;
    const memories = memoriesRes.data ?? [];

    const profileBlock = profile
      ? `# Founder profile\nName: ${profile.preferred_name ?? "unknown"}\nInterests: ${(profile.interests ?? []).join(", ") || "unknown"}\nExperience: ${profile.experience ?? "unknown"}\nAudience: ${profile.audience ?? "unknown"}\nGoals: ${profile.goals ?? "unknown"}\nWeekly hours: ${profile.weekly_hours ?? "unknown"}\nBudget: ${profile.budget_band ?? "unknown"}\nOn camera: ${profile.camera_comfort ?? "unknown"}\nExisting audience: ${profile.has_audience ?? "unknown"}`
      : "# Founder profile\n(not completed yet)";

    const memoryBlock = memories.length
      ? `# Notes to remember\n${memories.map((m) => `- [${m.memory_type}] ${m.content}`).join("\n")}`
      : "";

    const summaryBlock = summary ? `# Earlier conversation summary\n${summary}` : "";

    const system = [NOVA_SYSTEM_PROMPT, profileBlock, summaryBlock, memoryBlock]
      .filter(Boolean)
      .join("\n\n");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json(500, { error: "missing_lovable_api_key" });

    const gateway = createNovaGateway(lovableKey, getLovableAiGatewayRunId(req));
    const model = gateway(NOVA_MODELS.coach);

    const result = streamText({
      model,
      system,
      messages: convertToModelMessages(body.messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: body.messages,
      headers: corsHeaders,
      onFinish: async ({ messages }) => {
        try {
          // Save new messages only (last two typically: user + assistant)
          // Compute sequence numbers based on existing count
          const { count } = await supabase
            .from("nova_messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", body.conversationId);
          const baseSeq = count ?? 0;

          const rows = messages.map((m, idx) => ({
            conversation_id: body.conversationId,
            user_id: userId,
            message_id: m.id,
            role: m.role,
            content_text: (m.parts as { type: string; text?: string }[])
              .filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join("\n"),
            parts: m.parts,
            metadata: (m as { metadata?: unknown }).metadata ?? {},
            agent_type: agentType,
            sequence_no: baseSeq - messages.length + idx + 1 >= 0
              ? baseSeq - messages.length + idx + 1
              : idx,
          }));

          if (rows.length) {
            // Upsert against (conversation_id, message_id) so retries don't duplicate
            await supabase
              .from("nova_messages")
              .upsert(rows, { onConflict: "conversation_id,message_id" });
            await supabase
              .from("nova_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", body.conversationId);
          }
        } catch (e) {
          console.error("[chat-with-nova] persist error", e);
        }
      },
    });
  } catch (e) {
    console.error("[chat-with-nova] error", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
