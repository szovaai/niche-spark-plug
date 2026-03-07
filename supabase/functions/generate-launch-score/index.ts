import { corsHeaders } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { niche, targetAudience, productType, topic, productConcept, campaignAngles, userId } = await req.json();

    if (!niche || !productType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userTier = userId ? await getUserTier(userId) : "free";

    const anglesSection = campaignAngles?.length
      ? `\nCampaign Angles to score: ${JSON.stringify(campaignAngles.map((a: any) => a.name))}`
      : "";

    const prompt = `You are a digital product market analyst. Analyze this product idea and score it.

Niche: ${niche}
Target Audience: ${targetAudience || "General"}
Product Type: ${productType}
Topic: ${topic}
Product Concept: ${productConcept || "Not yet generated"}${anglesSection}

Score each dimension from 0-10 with honest assessment:
- demand: How much does this audience actively search for and buy solutions to this problem?
- competition: How crowded is this space? (10 = very little competition = good, 0 = extremely saturated = bad)
- monetization: How easy is it to charge premium prices for this type of product?
- audienceClarity: How well-defined and reachable is the target audience?
- offerStrength: How compelling is the product concept as a sellable offer?

Return ONLY valid JSON:
{
  "demand": 8,
  "competition": 6,
  "monetization": 9,
  "audienceClarity": 7,
  "offerStrength": 8,
  "overall": 76,
  "suggestions": [
    "Specific actionable improvement suggestion 1",
    "Specific actionable improvement suggestion 2",
    "Specific actionable improvement suggestion 3"
  ],
  "angleScores": [
    { "angle": "AngleName", "predictedConversion": "High", "reasoning": "Why this angle works or doesn't" }
  ]
}

The "overall" should be calculated as: (demand + competition + monetization + audienceClarity + offerStrength) * 2.
angleScores should have an entry for each campaign angle provided. predictedConversion must be "High", "Medium", or "Low".
suggestions should be specific, actionable improvements — not generic advice.`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
