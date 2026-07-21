// M4 — Generate a staged product outline (modules + sections) for the chosen concept.
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
  product_name: z.string(),
  subtitle: z.string(),
  format: z.string(),
  outcome: z.string(),
  modules: z.array(
    z.object({
      title: z.string(),
      purpose: z.string(),
      sections: z.array(z.object({ title: z.string(), summary: z.string() })),
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
    if (!bp?.product_concept) return json(400, { error: "no_product_concept" });

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "product_outline",
      _assigned_agent: "product_builder",
      _cost: 2,
      _input: { project_id },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's product builder. Design a focused outline for the founder's chosen product. It must feel practical — no fluff.

Product concept: ${bp.product_concept}
Promise: ${bp.product_promise ?? "unspecified"}
Niche: ${bp.niche}
Audience: ${bp.target_audience}
Problem: ${bp.customer_problem}
Desired outcome: ${bp.desired_outcome ?? "unspecified"}

Return:
- product_name: refined polished name
- subtitle: 6-10 word tagline that names the outcome
- format: physical format (PDF workbook, Notion toolkit, mini-course, template pack…)
- outcome: one-sentence transformation
- modules: 3-6 modules. Each has 3-6 sections.
  Each section has a specific action-first title and a 1-sentence summary of what it teaches or provides.

The outline should feel like a real product a customer would pay for, not a table of contents dump.`;

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
          mission_id: "m4",
          task_key: "outline_approved",
          label: "Approve the outline",
          status: "in_progress",
        } as never,
        { onConflict: "project_id,mission_id,task_key" },
      );

      return json(200, { ok: true, ...output });
    } catch (err) {
      await supabase.rpc("release_task_credits", { _task_id: taskId, _error: String((err as Error)?.message ?? err) });
      throw err;
    }
  } catch (e) {
    console.error("[generate-product-outline]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
