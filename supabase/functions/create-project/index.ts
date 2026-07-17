// Create a business project + its default Nova conversation.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  project_name: z.string().trim().min(1).max(200),
});

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

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json(400, { error: "invalid_body" });

    const { data: project, error: projErr } = await supabase
      .from("business_projects")
      .insert({
        user_id: userId,
        project_name: parsed.data.project_name,
        current_stage: "founder_profile",
        progress_pct: 12,
      })
      .select()
      .single();
    if (projErr || !project) return json(500, { error: projErr?.message ?? "insert_failed" });

    const { data: conv, error: convErr } = await supabase
      .from("nova_conversations")
      .insert({
        user_id: userId,
        project_id: project.id,
        title: parsed.data.project_name,
        kind: "coach",
      })
      .select()
      .single();
    if (convErr) return json(500, { error: convErr.message });

    // Seed the first coach memory
    await supabase.from("nova_memories").insert({
      user_id: userId,
      project_id: project.id,
      memory_type: "coach_note",
      content: `Project "${parsed.data.project_name}" created. Next stage: opportunity research.`,
      importance: 6,
    });

    return json(200, { ok: true, project, conversation: conv });
  } catch (e) {
    console.error("[create-project] error", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
