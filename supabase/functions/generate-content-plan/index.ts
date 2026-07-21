// M9 — Nova drafts a 30-day multi-channel content plan repurposed from the offer + emails.
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

const Post = z.object({
  day: z.number().int().min(1).max(30),
  channel: z.string(),
  format: z.string(),
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  repurposed_from: z.string(),
});

const Schema = z.object({
  primary_channel: z.string(),
  secondary_channels: z.array(z.string()).min(1).max(3),
  cadence: z.string(),
  headline: z.string(),
  strategy_summary: z.string(),
  channel_playbooks: z.array(z.object({
    channel: z.string(),
    voice: z.string(),
    best_formats: z.array(z.string()),
    posting_rules: z.array(z.string()),
  })),
  thirty_day_plan: z.array(Post),
  batching_tips: z.array(z.string()),
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

    const { project_id, primary_channel } = await req.json();
    if (!project_id) return json(400, { error: "missing_project_id" });
    if (!primary_channel) return json(400, { error: "missing_primary_channel" });

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

    const { data: campaigns } = await supabase
      .from("email_campaigns")
      .select("campaign_type, emails")
      .eq("project_id", project_id)
      .limit(4);

    const emailSnippets = (campaigns ?? [])
      .flatMap((c: { campaign_type: string; emails: unknown }) => {
        const arr = Array.isArray(c.emails) ? (c.emails as { subject?: string; hook?: string }[]) : [];
        return arr.slice(0, 2).map((e) => `[${c.campaign_type}] ${e.subject ?? e.hook ?? ""}`);
      })
      .slice(0, 8)
      .join("\n");

    const { data: reserved, error: resErr } = await supabase.rpc("reserve_task_credits", {
      _project_id: project_id,
      _task_name: "content_plan",
      _assigned_agent: "content_machine",
      _cost: 2,
      _input: { project_id, primary_channel },
    });
    if (resErr || !(reserved as { ok?: boolean })?.ok) return json(402, reserved ?? { error: "reservation_failed" });
    const taskId = (reserved as { task_id: string }).task_id;

    try {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json(500, { error: "missing_lovable_api_key" });
      const gateway = createNovaGateway(key, getLovableAiGatewayRunId(req));

      const prompt = `You are Nova's content strategist. Build a realistic 30-day content plan for a solo founder.

Project: ${proj.project_name}
Product: ${bp.product_concept}
Promise: ${bp.product_promise ?? "unspecified"}
Offer: ${bp.offer_summary ?? "unspecified"}
Price: $${bp.price ?? "?"}
Niche: ${bp.niche}
Audience: ${bp.target_audience}
Brand voice: ${bp.brand_voice ?? "warm, direct, no hype"}
Primary channel (locked): ${primary_channel}
${emailSnippets ? `\nEmail sequences already written (repurpose these):\n${emailSnippets}` : ""}

Return:
- primary_channel: "${primary_channel}"
- secondary_channels: 1-3 realistic supporting channels (pick from Pinterest, YouTube Shorts, TikTok, Instagram Reels, X/Twitter threads, LinkedIn, Threads, Substack notes) that fit the audience.
- cadence: honest posting frequency for a solo founder (e.g. "5 posts/week primary, 3/week secondary").
- headline: short banner (max 12 words).
- strategy_summary: 2-3 sentences on the angle + how repurposing works.
- channel_playbooks: one entry per channel (primary + secondaries). voice, best_formats (2-3), posting_rules (2-3 concrete rules).
- thirty_day_plan: 20-25 posts across days 1-30. Each: day (1-30), channel (must be one of the listed channels), format, hook (scroll-stopper first line), body (2-4 sentences, real content — no lorem, no placeholders), cta (soft or hard), repurposed_from (e.g. "Insight email #2", "Offer promise", "FAQ objection").
- batching_tips: 3-4 practical tips for batching content in 1-2 sessions/week.

Rules: no hype, no "leverage/optimize/unlock" language, no fake stats, no numbered emoji spam. Real posts a founder can actually publish.`;

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
    console.error("[generate-content-plan]", e);
    return json(500, { error: String((e as Error)?.message ?? e) });
  }
});
