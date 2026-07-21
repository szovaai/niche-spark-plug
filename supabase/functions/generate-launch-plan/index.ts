// M10 — Nova generates a go/no-go launch plan: pre-launch, launch day, and week-1.
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

const Item = z.object({
  key: z.string(),
  label: z.string(),
  detail: z.string(),
  owner: z.enum(["you", "nova"]),
  priority: z.enum(["critical", "important", "nice"]),
});

const Schema = z.object({
  headline: z.string(),
  launch_summary: z.string(),
  pre_launch: z.array(Item),
  launch_day: z.array(Item),
  week_one: z.array(Item),
  go_no_go: z.array(z.string()),
  first_promo_message: z.string(),
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
      _task_name: "launch_plan",
      _assigned_agent: "launch_engine",
      _cost: 2,
      _input: { project_id },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's launch director. Build a realistic solo-founder launch plan.

Project: ${proj.project_name}
Product: ${bp.product_concept}
Promise: ${bp.product_promise ?? "unspecified"}
Offer: ${bp.offer_summary ?? "unspecified"}
Price: $${bp.price ?? "?"}
Niche: ${bp.niche}
Audience: ${bp.target_audience}
Funnel platform: ${bp.funnel_platform ?? "unspecified"}
Payments: ${bp.payment_provider ?? "unspecified"}
Traffic source: ${bp.traffic_source ?? "unspecified"}

Return:
- headline: short launch banner (max 12 words)
- launch_summary: 2-3 sentence plain-English plan
- pre_launch: 5-8 checklist items to complete in the 5 days before launch
- launch_day: 5-8 tasks for the day the offer opens
- week_one: 4-6 follow-up actions across the first 7 days
- go_no_go: 3-5 hard checks that must be true to press "go live"
- first_promo_message: a real 2-3 sentence launch announcement the founder can copy-paste

Each checklist item: key (snake_case), label (short), detail (one sentence), owner ("you" or "nova"), priority ("critical" | "important" | "nice"). No hype, no fake urgency, no numbered lists in labels.`;

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
          mission_id: "m10",
          task_key: "launch_checklist",
          label: "Complete launch checklist",
          status: "pending",
        } as never,
        { onConflict: "project_id,mission_id,task_key" },
      );

      return json(200, { ok: true, ...output });
    } catch (err) {
      await supabase.rpc("release_task_credits", { _task_id: taskId, _error: String((err as Error)?.message ?? err) });
      throw err;
    }
  } catch (e) {
    console.error("[generate-launch-plan]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
