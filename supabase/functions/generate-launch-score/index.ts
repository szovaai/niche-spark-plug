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
      { field: 'price', type: 'number', maxLength: 100 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, targetAudience, productType, topic, productConcept, campaignAngles, price } = data;
    const fePrice = price || 17;
    const userTier = await getUserTier(user.id);

    const anglesSection = (campaignAngles as any[])?.length
      ? `\nCampaign Angles to score: ${JSON.stringify((campaignAngles as any[]).map((a: any) => a.name))}`
      : "";

    const prompt = `You are a digital product market analyst AND pricing strategist. Analyze this product idea, score it, and provide pricing psychology.

Niche: ${niche}
Target Audience: ${targetAudience || "General"}
Product Type: ${productType}
Topic: ${topic}
Product Concept: ${productConcept || "Not yet generated"}
Current Price Point: $${fePrice}${anglesSection}

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
  "verdict": "green",
  "verdictMessage": "One sentence summary of why this score was given",
  "suggestions": [
    "Specific actionable improvement suggestion 1",
    "Specific actionable improvement suggestion 2",
    "Specific actionable improvement suggestion 3"
  ],
  "suggestedPivots": [
    "Alternative angle or niche pivot suggestion 1",
    "Alternative angle 2",
    "Alternative angle 3"
  ],
  "estimatedPriceCeiling": 47,
  "affiliateCommissionSweet": "50% on $17 FE ($8.50 per sale)",
  "pricingPsychology": {
    "tiers": [
      { "name": "Budget Entry", "price": 7, "reasoning": "Why this price point works for this niche — impulse buy psychology", "recommended": false },
      { "name": "Value Sweet Spot", "price": 17, "reasoning": "Why this is the optimal price — perceived value vs cost balance", "recommended": true },
      { "name": "Premium Position", "price": 47, "reasoning": "Why premium can work — what extra value justifies this", "recommended": false }
    ],
    "paymentPlanSuggestion": "Offer 3x $13 payments for orders over $27 — increases conversions 20-30% on cold traffic",
    "anchoringCopy": "Drop-in copy that anchors the price against expensive alternatives (e.g., 'A single coaching session costs $200+. This entire system is yours for just $17.')",
    "scarcityCopy": "Urgency/scarcity copy snippet (e.g., 'This introductory price ends when we hit 500 copies. After that, it goes to $37.')",
    "riskReversalCopy": "Named guarantee copy (e.g., 'The 30-Day No-Questions-Asked Guarantee: Try every strategy. If you don't see results, email us for a full refund.')"
  },
  "angleScores": [
    { "angle": "AngleName", "predictedConversion": "High", "reasoning": "Why this angle works or doesn't" }
  ]
}

SCORING RULES:
- The "overall" should be calculated as: (demand + competition + monetization + audienceClarity + offerStrength) * 2.
- "verdict" MUST be: "green" if overall >= 75, "yellow" if overall >= 50, "red" if overall < 50.
- "suggestedPivots" should have 3 entries ONLY if verdict is "red" or "yellow". For green, use an empty array.
- "estimatedPriceCeiling" is the maximum front-end price this niche can support (typically $7-$97).
- "affiliateCommissionSweet" describes the ideal commission structure for this product.
- angleScores should have an entry for each campaign angle provided. predictedConversion must be "High", "Medium", or "Low".
- suggestions should be specific, actionable improvements — not generic advice.
- pricingPsychology tiers must have exactly 3 options with realistic niche-specific pricing.
- anchoringCopy must compare against a real expensive alternative in this niche.
- riskReversalCopy must include a named guarantee (not just "money-back guarantee").`;

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
