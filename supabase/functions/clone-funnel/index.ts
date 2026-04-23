import { corsHeaders } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    const { sourceFunnel, newProductName, newAudience, newNiche, tone, improve, sourceProduct } = await req.json();

    if (!sourceFunnel) {
      return new Response(JSON.stringify({ error: "sourceFunnel is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!improve) {
      return new Response(JSON.stringify({ funnel: sourceFunnel }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userTier = await getUserTier(userId);

    const toneDirective: Record<string, string> = {
      warriorplus: "Write in high-energy direct-response style: urgency, scarcity, value stacking, pattern interrupts, bold claims, countdown energy.",
      authority: "Write in authority style: expert positioning, data-backed claims, professional tone, proof-heavy.",
      friendly: "Write in friendly conversational style: approachable, encouraging, like a helpful mentor.",
      bold: "Write in bold disruptive style: big claims, pattern interrupts, challenging assumptions, provocative hooks.",
    };

    const funnelKeys = ["salesPage", "optInPage", "thankYouPage", "bonusPage", "checkoutCopy", "orderBump", "upsellOffer"];
    const rewrittenFunnel: Record<string, any> = { ...sourceFunnel };

    // Also handle salesPageSections if present
    const hasSections = sourceFunnel.salesPageSections && typeof sourceFunnel.salesPageSections === "object";

    for (const key of funnelKeys) {
      const original = sourceFunnel[key];
      if (!original || typeof original !== "string") continue;

      const prompt = `You are a world-class direct response copywriter. Rewrite the following funnel copy for a NEW product.

ORIGINAL COPY:
${original}

NEW CONTEXT:
- Product Name: ${newProductName || "keep similar"}
- Target Audience: ${newAudience || "keep similar"}  
- Niche: ${newNiche || "keep similar"}

TONE: ${toneDirective[tone] || toneDirective.warriorplus}

INSTRUCTIONS:
- Rewrite ALL copy for the new product/audience
- IMPROVE headlines with stronger hooks and pattern interrupts
- Add better urgency and scarcity elements
- Strengthen the value proposition
- Keep the same structure and format (markdown)
- Make it MORE persuasive than the original
- Output ONLY the rewritten copy, no explanations`;

      const { content } = await callTieredAI(
        [{ role: "user", content: prompt }],
        userTier,
        "standard"
      );
      rewrittenFunnel[key] = content;
    }

    // If structured salesPageSections exist, rewrite those too
    if (hasSections) {
      const sectionsPrompt = `You are a world-class direct response copywriter. Rewrite this structured sales page for a NEW product.

ORIGINAL SECTIONS (JSON):
${JSON.stringify(sourceFunnel.salesPageSections, null, 2)}

NEW CONTEXT:
- Product Name: ${newProductName || "keep similar"}
- Target Audience: ${newAudience || "keep similar"}
- Niche: ${newNiche || "keep similar"}

TONE: ${toneDirective[tone] || toneDirective.warriorplus}

INSTRUCTIONS:
- Rewrite every section for the new product/audience
- IMPROVE all headlines, hooks, and calls to action
- Update productBreakdown modules and bonusStack for the new niche
- Keep the exact same JSON structure
- Make it MORE persuasive
- Output ONLY valid JSON, no explanations`;

      const { content: sectionsContent } = await callTieredAI(
        [{ role: "user", content: sectionsPrompt }],
        userTier,
        "complex"
      );

      try {
        const cleaned = sectionsContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        rewrittenFunnel.salesPageSections = JSON.parse(cleaned);
      } catch {
        console.warn("Failed to parse rewritten salesPageSections, keeping original");
      }
    }

    return new Response(JSON.stringify({ funnel: rewrittenFunnel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("clone-funnel error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
