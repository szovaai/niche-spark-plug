import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const tier = await getUserTier(auth.user.id);
    const { productName, niche, audience, price, painPoint } = await req.json();

    const systemPrompt = `You write conversion-ready Shopify store copy in a direct-response, buyer-driven voice. Avoid corporate jargon ("leverage", "elevate", "game changer"). Return strict JSON.`;
    const userPrompt = `Generate a complete Shopify product launch pack for:
Product: ${productName}
Niche: ${niche}
Audience: ${audience}
Price: $${price}
Pain solved: ${painPoint}

Return JSON with EXACTLY these keys:
{
  "hero_headline": "string (8-12 words)",
  "subheadline": "string (1 sentence)",
  "product_description": "string (3 short paragraphs)",
  "benefit_bullets": ["string", ... 6 items],
  "faq": [{"q":"...","a":"..."}, ... 6 items],
  "reviews": [{"name":"...","stars":5,"text":"..."}, ... 5 items, realistic but mock],
  "upsell_offer": "string (2-3 sentences)",
  "order_bump": "string (1-2 sentences)",
  "urgency_copy": "string (1 punchy line)",
  "thank_you_offer": "string (2-3 sentences)"
}
ONLY JSON.`;

    const { content } = await callTieredAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tier,
      "standard"
    );

    let assets: any = {};
    try {
      assets = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      throw new Error("Failed to parse Shopify assets");
    }

    return new Response(JSON.stringify({ assets }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-shopify-assets error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
