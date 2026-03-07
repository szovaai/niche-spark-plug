import { corsHeaders } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";

const HUMAN_TONE = `Write like a real person — use contractions, vary sentence length, add personality. Sound confident but not salesy. Avoid corporate buzzwords.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, targetAudience, productType, topic, userId } = await req.json();

    if (!niche || !productType || !topic) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const cacheKey = `launch-product-${niche}-${productType}-${topic}`;
    const cached = await getCachedResponse(cacheKey, "generate-launch-product");
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = userId ? await getUserTier(userId) : "free";

    const prompt = `${HUMAN_TONE}

You are a digital product strategist. Create a compelling product concept.

Niche: ${niche}
Target Audience: ${targetAudience || "General audience"}
Product Type: ${productType}
Topic: ${topic}

Return ONLY valid JSON:
{
  "title": "Catchy product title",
  "subtitle": "Compelling subtitle",
  "concept": "2-3 sentence product concept explaining what this is and why it matters",
  "uniqueMechanism": "The unique angle or method that makes this different from competitors",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"],
  "mechanisms": [
    { "name": "The [Adjective] [Noun] [Method/Protocol/System/Framework]", "tagline": "A punchy one-liner that captures the essence", "description": "2 sentences explaining how this framework works and why it's different" },
    { "name": "The [Adjective] [Noun] [Method/Protocol/System/Framework]", "tagline": "A punchy one-liner", "description": "2 sentences explaining the framework" },
    { "name": "The [Adjective] [Noun] [Method/Protocol/System/Framework]", "tagline": "A punchy one-liner", "description": "2 sentences explaining the framework" }
  ],
  "campaignAngles": [
    { "name": "Speed", "hook": "A short punchy hook for this angle", "description": "2 sentences explaining why this angle resonates with the audience" },
    { "name": "Simplicity", "hook": "A short punchy hook for this angle", "description": "2 sentences explaining why this angle resonates with the audience" },
    { "name": "Results", "hook": "A short punchy hook for this angle", "description": "2 sentences explaining why this angle resonates with the audience" }
  ]
}

IMPORTANT for mechanisms:
- Each mechanism must be a named, proprietary-sounding framework (e.g., "The Rapid Launch Protocol", "The AI Funnel Sprint", "The 1-Hour Product Framework")
- They should feel like branded methods that make the product unique
- Each must suggest a different approach or philosophy

The campaignAngles should be 3 distinctly different sales angles for marketing this product. Each angle should suggest a completely different emotional trigger. The hook should be a single compelling sentence usable as an ad headline.`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-product", result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
