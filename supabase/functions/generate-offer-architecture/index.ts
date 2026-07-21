// M5 — Draft a commercial offer architecture: naming, pricing, bonuses, order bump, upsell, guarantee.
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
  headline_offer: z.string(),
  core_promise: z.string(),
  price_options: z.array(
    z.object({
      tier: z.string(),
      price: z.number(),
      reasoning: z.string(),
      best_for: z.string(),
    }),
  ),
  recommended_price: z.number(),
  bonuses: z.array(z.object({ name: z.string(), value: z.string(), reason: z.string() })),
  order_bump: z.object({ name: z.string(), price: z.number(), pitch: z.string() }),
  upsell: z.object({ name: z.string(), price: z.number(), pitch: z.string() }),
  downsell: z.object({ name: z.string(), price: z.number(), pitch: z.string() }),
  guarantee: z.string(),
  risk_reversal: z.string(),
  stack_summary: z.string(),
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
      _task_name: "offer_architecture",
      _assigned_agent: "offer_architect",
      _cost: 2,
      _input: { project_id },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's offer architect. Design a commercial offer for a solo founder — real, defendable pricing (no random bonus stacks).

Product: ${bp.product_concept}
Promise: ${bp.product_promise ?? "unspecified"}
Niche: ${bp.niche}
Audience: ${bp.target_audience}
Problem: ${bp.customer_problem}
Desired outcome: ${bp.desired_outcome ?? "unspecified"}

Return:
- headline_offer: the offer headline (7-14 words)
- core_promise: single-sentence transformation
- price_options: exactly 3 tiers labelled "Fast", "Balanced", "Premium" with USD prices and why-this-price reasoning + best_for audience
- recommended_price: your recommended default price (usually Balanced)
- bonuses: 2-4 bonuses. Each with a stated "value" (like "$47 value") and a real reason it complements the core
- order_bump: one small add-on ($7-27) with pitch
- upsell: one upgrade ($47-197) with pitch
- downsell: fallback if they decline upsell ($17-37)
- guarantee: specific guarantee wording (30-day / conditional / results-based)
- risk_reversal: how it removes buyer risk in plain English
- stack_summary: 2-3 sentence pitch summarizing everything the buyer gets

Avoid inflated fake bonus stacks. Prices must feel earned.`;

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
          mission_id: "m5",
          task_key: "offer_map",
          label: "Draft the offer map",
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
    console.error("[generate-offer-architecture]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
