// M7 — Nova recommends a funnel + payments stack and a setup checklist.
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

const Recommendation = z.object({
  path: z.enum(["fast", "starter", "advanced"]),
  funnel_platform: z.string(),
  payment_provider: z.string(),
  reasoning: z.string(),
  monthly_cost_estimate: z.string(),
  setup_time_estimate: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const ChecklistItem = z.object({
  key: z.string(),
  label: z.string(),
  detail: z.string(),
  link_hint: z.string().nullable(),
});

const Schema = z.object({
  recommended_path: z.enum(["fast", "starter", "advanced"]),
  headline: z.string(),
  summary: z.string(),
  options: z.array(Recommendation).length(3),
  setup_checklist: z.array(ChecklistItem),
  test_transaction_steps: z.array(z.string()),
  common_pitfalls: z.array(z.string()),
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
      .select("id, user_id, project_name")
      .eq("id", project_id)
      .maybeSingle();
    if (!proj || proj.user_id !== userId) return json(403, { error: "forbidden" });

    const { data: bp } = await supabase
      .from("business_blueprints")
      .select("*")
      .eq("project_id", project_id)
      .maybeSingle();
    if (!bp?.product_concept) return json(400, { error: "blueprint_incomplete" });

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "payments_plan",
      _assigned_agent: "payments_engine",
      _cost: 1,
      _input: { project_id },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's launch strategist. Recommend the right funnel + payments stack for this solo founder.

Product: ${bp.product_concept}
Promise: ${bp.product_promise ?? "unspecified"}
Price: $${bp.price ?? "?"}
Offer: ${bp.offer_summary ?? "unspecified"}
Niche: ${bp.niche}
Audience: ${bp.target_audience}

Return three real, distinct options:
- fast: fastest path to first sale (e.g. Gumroad, Stan Store, ThriveCart Basic). Under 1 hour setup. All-in-one link.
- starter: best balance for a solo founder (e.g. Systeme.io, Beehiiv paid, SamCart). Cheap monthly, supports upsells.
- advanced: full funnel builder for scaling (e.g. GoHighLevel, ClickFunnels, custom Stripe checkout). More powerful, more setup.

For each: funnel_platform (real product name), payment_provider (real provider name), reasoning (1 sentence why this fits THIS product/price/audience), monthly_cost_estimate, setup_time_estimate, pros (2-3), cons (1-2).

Then pick recommended_path based on price + audience + solo-founder reality.

setup_checklist: 5-7 concrete steps for the recommended path. Each item: key (snake_case), label (short), detail (one sentence), link_hint (short label like "Stripe Dashboard → Products" or null).

test_transaction_steps: 3-5 steps to run a real end-to-end test purchase.
common_pitfalls: 3-4 real mistakes founders make (payout delays, currency, tax, refund policy, etc.).

No hype. No affiliate pitching. Use real product names, not made-up ones.`;

      const { output } = await generateText({
        model: gateway(NOVA_MODELS.blueprint),
        output: Output.object({ schema: Schema }),
        prompt,
      });

      await supabase.rpc("finalize_task_credits", { _task_id: taskId, _output: output });

      return json(200, { ok: true, ...output });
    } catch (err) {
      await supabase.rpc("release_task_credits", { _task_id: taskId, _error: String((err as Error)?.message ?? err) });
      throw err;
    }
  } catch (e) {
    console.error("[generate-payments-plan]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
