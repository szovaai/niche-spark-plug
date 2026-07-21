// Generate 3 focused product concepts from a validated problem.
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
  concepts: z.array(
    z.object({
      name: z.string(),
      format: z.string(),
      promise: z.string(),
      contents: z.array(z.string()),
      transformation: z.string(),
      time_to_result: z.string(),
      why_this_wins: z.string(),
      price_range: z.string(),
      effort_score: z.number(),
      demand_fit_score: z.number(),
    }),
  ),
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
    if (!bp?.niche) return json(400, { error: "blueprint_incomplete" });

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "product_concepts",
      _assigned_agent: "product_concept_engine",
      _cost: 2,
      _input: { project_id },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(lovableKey, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's product architect. Draft 3 distinct FIRST product concepts a solo founder could launch quickly.

Niche: ${bp.niche}
Audience: ${bp.target_audience}
Problem: ${bp.customer_problem}
Desired outcome: ${bp.desired_outcome ?? "unspecified"}

Each concept must be shippable solo in 2-4 weeks. Vary the format across the 3 (e.g., PDF playbook, Notion toolkit, mini-course, template pack, checklist bundle).

For each:
- name: catchy specific product name
- format: what it physically is (PDF, Notion, video series, template pack, hybrid)
- promise: one-sentence outcome promise
- contents: 5-8 concrete deliverables inside
- transformation: before -> after in the customer's life
- time_to_result: how fast the customer sees a win
- why_this_wins: 1-2 sentences on why this beats what's out there
- price_range: e.g. "$27-47"
- effort_score 0-100 (100 = fastest to build)
- demand_fit_score 0-100

Be specific. No generic "ultimate guide to X". Products should feel like they were built by someone who's actually done the thing.`;

      const { output } = await generateText({
        model: gateway(NOVA_MODELS.blueprint),
        output: Output.object({ schema: Schema }),
        prompt,
      });

      await supabase.rpc("finalize_task_credits", { _task_id: taskId, _output: output });

      await supabase.from("mission_tasks").upsert(
        {
          project_id,
          user_id: userId,
          mission_id: "m3",
          task_key: "generate_concepts",
          label: "Generate 3 product concepts",
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
    console.error("[generate-product-concepts]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
