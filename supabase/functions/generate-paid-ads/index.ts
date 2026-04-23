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
    const { productName, niche, audience, painPoint, mechanism } = await req.json();

    const systemPrompt = `You are a direct-response paid ads creative director. Write scroll-stopping, pattern-interrupt ad copy. No corporate words. Return strict JSON.`;
    const userPrompt = `Create a complete paid ads pack for:
Product: ${productName}
Niche: ${niche}
Audience: ${audience}
Pain: ${painPoint}
Mechanism: ${mechanism || "proprietary system"}

Return JSON with EXACTLY:
{
  "tiktok": {
    "hooks": ["string", ... 10 hooks],
    "ugc_scripts": ["string (15-30 sec script)", ... 5],
    "ctas": ["string", ... 5]
  },
  "facebook": {
    "direct_response": ["string (3-4 line ad)", ... 5],
    "curiosity": ["string", ... 5],
    "story": ["string", ... 5]
  },
  "pinterest": {
    "pin_headlines": ["string", ... 10]
  },
  "google": {
    "search_headlines": ["string (max 30 chars)", ... 10]
  }
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

    let ads: any = {};
    try {
      ads = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    } catch {
      throw new Error("Failed to parse ads pack");
    }

    return new Response(JSON.stringify({ ads }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-paid-ads error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
