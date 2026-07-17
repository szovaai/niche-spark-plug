// Summarize a conversation's oldest unsummarized turns into a single memory,
// then mark those turns as summarized (WITHOUT deleting them — audit-safe).
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateText } from "npm:ai";
import { createNovaGateway } from "../_shared/novaGateway.ts";
import { NOVA_MODELS } from "../_shared/novaModels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUMMARY_TRIGGER = 20; // meaningful turns before we roll up
const KEEP_RECENT = 8;      // keep last N turns raw

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
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return json(401, { error: "unauthenticated" });
    const userId = userRes.user.id;

    const { conversationId } = await req.json();
    if (!conversationId) return json(400, { error: "conversation_id_required" });

    const { data: conv } = await supabase
      .from("nova_conversations")
      .select("id,user_id,project_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv || conv.user_id !== userId) return json(403, { error: "forbidden" });

    // Count unsummarized turns
    const { count } = await supabase
      .from("nova_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .is("summarized_at", null);

    if (!count || count < SUMMARY_TRIGGER) {
      return json(200, { ok: true, skipped: true, count });
    }

    // Take oldest turns to summarize; keep the newest KEEP_RECENT raw
    const takeCount = count - KEEP_RECENT;
    const { data: turns } = await supabase
      .from("nova_messages")
      .select("id, role, content_text, sequence_no")
      .eq("conversation_id", conversationId)
      .is("summarized_at", null)
      .order("sequence_no", { ascending: true })
      .limit(takeCount);
    if (!turns?.length) return json(200, { ok: true, skipped: true });

    const transcript = turns
      .map((t) => `${t.role.toUpperCase()}: ${t.content_text ?? ""}`)
      .join("\n\n");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json(500, { error: "missing_lovable_api_key" });

    const gateway = createNovaGateway(lovableKey);
    const model = gateway(NOVA_MODELS.summary);

    const { text } = await generateText({
      model,
      system:
        "You are Nova's memory keeper. Summarize this conversation into a short, factual brief for future context: decisions made, preferences stated, open questions, and the next action. 6–10 short bullet points. No fluff.",
      prompt: transcript,
    });

    const { data: memory, error: memErr } = await supabase
      .from("nova_memories")
      .insert({
        user_id: userId,
        project_id: conv.project_id,
        memory_type: "summary",
        content: text,
        importance: 8,
      })
      .select("id")
      .single();
    if (memErr) throw memErr;

    // Mark turns as summarized WITHOUT deleting them
    await supabase
      .from("nova_messages")
      .update({ summarized_at: new Date().toISOString(), summary_memory_id: memory.id })
      .in("id", turns.map((t) => t.id));

    return json(200, { ok: true, summarized: turns.length, memory_id: memory.id });
  } catch (e) {
    console.error("[summarize-conversation] error", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
