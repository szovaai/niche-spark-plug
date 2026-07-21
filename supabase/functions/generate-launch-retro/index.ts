// M11 — Post-launch retro: analyzes captured metrics + blueprint and returns a plain-English improve loop.
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
  verdict: z.enum(["strong", "promising", "flat", "struggling"]),
  scoreboard: z.object({
    conversion_rate: z.string(),
    revenue_per_visitor: z.string(),
    biggest_lever: z.string(),
  }),
  what_worked: z.array(z.string()),
  what_didnt: z.array(z.string()),
  next_plays: z.array(
    z.object({
      title: z.string(),
      why: z.string(),
      effort: z.enum(["low", "medium", "high"]),
    }),
  ),
  coach_note: z.string(),
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

    const [{ data: bp }, { data: metrics }] = await Promise.all([
      supabase.from("business_blueprints").select("*").eq("project_id", project_id).maybeSingle(),
      supabase
        .from("launch_metrics")
        .select("visitors, optins, sales, revenue, refunds, upsell_sales, upsell_revenue, email_opens, email_clicks, notes, date")
        .eq("project_id", project_id)
        .order("date", { ascending: true }),
    ]);

    if (!metrics || metrics.length === 0) return json(400, { error: "no_metrics" });

    const totals = metrics.reduce(
      (a, m) => ({
        visitors: a.visitors + (m.visitors ?? 0),
        optins: a.optins + (m.optins ?? 0),
        sales: a.sales + (m.sales ?? 0),
        revenue: a.revenue + Number(m.revenue ?? 0),
        refunds: a.refunds + (m.refunds ?? 0),
        upsell_sales: a.upsell_sales + (m.upsell_sales ?? 0),
        upsell_revenue: a.upsell_revenue + Number(m.upsell_revenue ?? 0),
        email_opens: a.email_opens + (m.email_opens ?? 0),
        email_clicks: a.email_clicks + (m.email_clicks ?? 0),
      }),
      { visitors: 0, optins: 0, sales: 0, revenue: 0, refunds: 0, upsell_sales: 0, upsell_revenue: 0, email_opens: 0, email_clicks: 0 },
    );

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "launch_retro",
      _assigned_agent: "improve_engine",
      _cost: 2,
      _input: { project_id, totals },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const notes = metrics.map((m) => m.notes).filter(Boolean).join(" | ");

      const prompt = `You are Nova running a post-launch retro. Be honest, specific, no hype.

Project: ${proj.project_name}
Product: ${bp?.product_concept ?? "unspecified"}
Offer: ${bp?.offer_summary ?? "unspecified"}
Price: $${bp?.price ?? "?"}
Audience: ${bp?.target_audience ?? "unspecified"}
Traffic source: ${bp?.traffic_source ?? "unspecified"}

Metrics across ${metrics.length} day(s):
- Visitors: ${totals.visitors}
- Opt-ins: ${totals.optins}
- Sales: ${totals.sales}
- Revenue: $${totals.revenue.toFixed(2)}
- Refunds: ${totals.refunds}
- Upsell sales / revenue: ${totals.upsell_sales} / $${totals.upsell_revenue.toFixed(2)}
- Email opens / clicks: ${totals.email_opens} / ${totals.email_clicks}
Founder notes: ${notes || "(none)"}

Return:
- verdict: strong | promising | flat | struggling
- scoreboard.conversion_rate: e.g. "1.8% (sales/visitors)"
- scoreboard.revenue_per_visitor: e.g. "$0.42 RPV"
- scoreboard.biggest_lever: the ONE metric that would move revenue most next launch
- what_worked: 2-4 concrete wins grounded in the numbers
- what_didnt: 2-4 concrete misses, again grounded in numbers or notes
- next_plays: 3-5 recommended moves, each with title / why / effort
- coach_note: 2-3 sentence encouragement + honest reality check

If a metric is 0, don't pretend it's fine. Recommend the specific fix.`;

      const { output } = await generateText({
        model: gateway(NOVA_MODELS.blueprint),
        output: Output.object({ schema: Schema }),
        prompt,
      });

      await supabase.rpc("finalize_task_credits", { _task_id: taskId, _output: output });

      await supabase.from("mission_tasks").upsert(
        [
          {
            project_id,
            user_id: userId,
            mission_id: "m11",
            task_key: "capture_metrics",
            label: "Capture launch metrics",
            status: "done",
            approved_at: new Date().toISOString(),
          },
          {
            project_id,
            user_id: userId,
            mission_id: "m11",
            task_key: "retro_session",
            label: "Run a retro with Nova",
            status: "done",
            approved_at: new Date().toISOString(),
          },
        ] as never,
        { onConflict: "project_id,mission_id,task_key" },
      );
      await supabase.from("mission_progress").upsert(
        {
          project_id,
          user_id: userId,
          mission_id: "m11",
          status: "complete",
          progress_pct: 100,
          completed_at: new Date().toISOString(),
        } as never,
        { onConflict: "project_id,mission_id" },
      );

      return json(200, { ok: true, ...output, totals });
    } catch (err) {
      await supabase.rpc("release_task_credits", { _task_id: taskId, _error: String((err as Error)?.message ?? err) });
      throw err;
    }
  } catch (e) {
    console.error("[generate-launch-retro]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
