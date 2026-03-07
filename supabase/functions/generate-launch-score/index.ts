import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'niche', type: 'string', required: true, maxLength: 200 },
      { field: 'targetAudience', type: 'string', maxLength: 500 },
      { field: 'productType', type: 'string', required: true, maxLength: 100 },
      { field: 'topic', type: 'string', maxLength: 500 },
      { field: 'productConcept', type: 'string', maxLength: 2000 },
      { field: 'campaignAngles', type: 'array', maxItems: 10 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, targetAudience, productType, topic, productConcept, campaignAngles } = data;

    const userTier = await getUserTier(user.id);

    const anglesSection = (campaignAngles as any[])?.length
      ? `\nCampaign Angles to score: ${JSON.stringify((campaignAngles as any[]).map((a: any) => a.name))}`
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
    return new Response(JSON.stringify({ error: "Unable to generate launch score. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
