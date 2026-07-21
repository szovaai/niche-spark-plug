// Validate the problem — score demand, urgency, competition, monetization, and produce a report.
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateText, Output } from "npm:ai";
import { z } from "npm:zod";
import { createNovaGateway, getLovableAiGatewayRunId } from "../_shared/novaGateway.ts";
import { NOVA_MODELS } from "../_shared/novaModels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (s: number, b: unknown) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Schema = z.object({
  verdict: z.enum(["strong", "viable", "risky", "avoid"]),
  headline: z.string(),
  demand_score: z.number(),
  urgency_score: z.number(),
  competition_score: z.number(),
  monetization_score: z.number(),
  overall_score: z.number(),
  problem_statement: z.string(),
  target_audience: z.string(),
  proof_points: z.array(z.string()),
  risks: z.array(z.string()),
  recommended_next_step: z.string(),
});

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
    if (!userRes?.user) return json(401, { error: "unauthenticated" });
    const userId = userRes.user.id;

    const { project_id } = await req.json();
    if (!project_id) return json(400, { error: "missing_project_id" });

    const { data: proj } = await supabase
      .from("business_projects")
      .select("id, user_id")
      .eq("id", project_id)
      .maybeSingle();
    if (!proj || proj.user_id !== userId) return json(403, { error: "forbidden" });

    const { data: bp } = await supabase
      .from("business_blueprints")
      .select("*")
      .eq("project_id", project_id)
      .maybeSingle();
    if (!bp?.niche) return json(400, { error: "blueprint_incomplete", message: "Complete Mission 1 first — pick a niche." });

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "validation_report",
      _assigned_agent: "validation_engine",
      _cost: 2,
      _input: { project_id },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(lovableKey, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's validation researcher. Assess whether this niche/problem is worth pursuing.

Niche: ${bp.niche}
Audience: ${bp.target_audience ?? "unspecified"}
Problem: ${bp.customer_problem ?? "unspecified"}
Product idea so far: ${bp.product_concept ?? "unspecified"}

Return:
- verdict: strong | viable | risky | avoid
- headline: one-sentence honest read
- Scores 0-100: demand (observable demand), urgency (how badly they want it solved now), competition (100 = wide open), monetization (willingness to pay). overall_score = weighted composite.
- problem_statement: sharpened one-paragraph problem
- target_audience: sharpened one-paragraph audience
- proof_points: 3-5 concrete evidence signals (subreddits, YT channels, marketplaces, adjacency to paying markets). Label "observed" or "estimated".
- risks: 2-4 honest reasons this could fail
- recommended_next_step: one sentence
Be direct. Do not soften. If the idea is weak, say so and recommend a pivot.`;

      const { output } = await generateText({
        model: gateway(NOVA_MODELS.blueprint),
        output: Output.object({ schema: Schema }),
        prompt,
      });

      await supabase.rpc("finalize_task_credits", { _task_id: taskId, _output: output });

      // Auto-progress M2
      await supabase.from("mission_tasks").upsert(
        {
          project_id,
          user_id: userId,
          mission_id: "m2",
          task_key: "validation_report",
          label: "Generate validation report",
          status: "done",
          approved_at: new Date().toISOString(),
        } as never,
        { onConflict: "project_id,mission_id,task_key" },
      );

      return json(200, { ok: true, ...output });
    } catch (err) {
      await supabase.rpc("release_task_credits", { _task_id: taskId, _error: String((err as Error)?.message ?? err) });
      throw err;
    }
  } catch (e) {
    console.error("[validate-problem]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
