import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAuth } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODE_GUIDANCE: Record<string, string> = {
  buyer_problems: "Focus on raw, urgent buyer pains people complain about online (Reddit/Quora/TikTok comments).",
  paid_ad_ready: "Focus on emotional, scroll-stopping pains that perform on Facebook/TikTok paid ads.",
  shopify_winners: "Focus on physical-feeling digital products that fit Shopify stores (guides, programs, templates).",
  etsy_trends: "Focus on printables, planners, journals, templates that sell on Etsy.",
  printables: "Focus exclusively on printable PDF products (planners, trackers, worksheets).",
  evergreen: "Focus on stable, year-round demand niches (health, money, relationships, pets).",
  fast_launch: "Focus on opportunities that can be launched in under 7 days with minimal assets.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await validateAuth(req);
    if (auth.error || !auth.user) {
      return new Response(JSON.stringify({ error: auth.error || "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(auth.user.id);
    const body = await req.json().catch(() => ({}));
    const keyword = (body.keyword || "").toString().trim().slice(0, 120);
    const mode = (body.mode || "buyer_problems").toString();
    const targetNiche = (body.targetNiche || "").toString().trim().slice(0, 120);
    const targetKeywords = Array.isArray(body.targetKeywords) ? body.targetKeywords.slice(0, 10).map((k: any) => String(k).slice(0, 60)) : [];
    const modeGuide = MODE_GUIDANCE[mode] || MODE_GUIDANCE.buyer_problems;

    // Cache check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);
    const cacheKey = `radar:${mode}:${keyword.toLowerCase() || "_default"}`;

    const { data: cached } = await sb
      .from("opportunities")
      .select("*")
      .eq("keyword", keyword || "_default")
      .eq("mode", mode)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(8);

    if (cached && cached.length >= 6) {
      return new Response(JSON.stringify({ opportunities: cached, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nicheDirective = targetNiche && targetNiche.toLowerCase() !== "all"
      ? `\n\nNICHE FOCUS: Focus EXCLUSIVELY on the "${targetNiche}" niche. Every opportunity returned must serve this audience.${targetKeywords.length ? ` Related keywords/themes: ${targetKeywords.join(", ")}.` : ""}`
      : "";

    const systemPrompt = `You are a buyer-pain intelligence engine for digital product creators. You blend signals from Google autocomplete, Reddit complaints, Quora questions, TikTok comments, Etsy demand, and Pinterest trends to surface real, monetizable buyer problems.

${modeGuide}${nicheDirective}

Generate 8 opportunities. For EACH opportunity return JSON with:
- "title": punchy product name (e.g. "Menopause Belly Fat Reset")
- "niche": niche category (short, lowercase)
- "demand": 1-10 (search/trend volume)
- "pain": 1-10 (urgency to solve)
- "competition": 1-10 (LOWER = easier; this is "competition ease" — invert mental model: 10 = wide open, 1 = saturated)
- "emotion": 1-10 (emotional trigger strength)
- "ad_potential": 1-10 (paid ad scroll-stop potential)
- "upsell": 1-10 (upsell/backend potential)
- "score": weighted /100 = round(demand*2.5 + pain*2 + competition*1.5 + emotion*1.5 + ad_potential*1.5 + upsell*1)
- "hooks": array of 5 short ad hook lines
- "suggested_price": one of 17, 27, 37, 47
- "platform": one of "Shopify", "Gumroad", "Etsy", "Digital Marketplace"
- "target_audience": specific buyer (1 sentence)
- "pain_analysis": 2-sentence emotional frustration summary
- "upsell_ideas": array of 3 short upsell concepts
- "trend_velocity": "Rising" | "Stable" | "Seasonal"

Return ONLY a JSON array of 8 objects. No markdown, no explanation.`;

    const { content } = await callTieredAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Keyword/topic: "${keyword || "any high-intent buyer pain"}". Mode: ${mode}.` },
      ],
      userTier,
      "standard"
    );

    let parsed: any[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Parse fail:", content);
      throw new Error("Failed to parse opportunity data");
    }

    // Persist to opportunities table
    const rows = parsed.map((o) => ({
      keyword: keyword || "_default",
      mode,
      title: o.title,
      niche: o.niche,
      score: Math.max(0, Math.min(100, Math.round(o.score || 0))),
      demand: o.demand,
      pain: o.pain,
      competition: o.competition,
      emotion: o.emotion,
      ad_potential: o.ad_potential,
      upsell: o.upsell,
      hooks: o.hooks || [],
      suggested_price: o.suggested_price,
      platform: o.platform,
      payload: {
        target_audience: o.target_audience,
        pain_analysis: o.pain_analysis,
        upsell_ideas: o.upsell_ideas,
        trend_velocity: o.trend_velocity,
      },
    }));

    const { data: inserted } = await sb.from("opportunities").insert(rows).select();

    return new Response(JSON.stringify({ opportunities: inserted || rows, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("opportunity-radar error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
