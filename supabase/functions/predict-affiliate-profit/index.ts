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
      { field: 'productType', type: 'string', required: true, maxLength: 100 },
      { field: 'productName', type: 'string', maxLength: 300 },
      { field: 'frontEndPrice', type: 'number' },
      { field: 'upsellPrices', type: 'array', maxItems: 5 },
      { field: 'commissionPercent', type: 'number' },
      { field: 'hasUpsells', type: 'boolean' },
      { field: 'targetAudience', type: 'string', maxLength: 500 },
      { field: 'offerSummary', type: 'string', maxLength: 2000 },
      { field: 'bonusCount', type: 'number' },
      { field: 'guaranteeType', type: 'string', maxLength: 200 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const {
      niche, productType, productName, frontEndPrice = 17,
      upsellPrices = [], commissionPercent = 50, hasUpsells = false,
      targetAudience, offerSummary, bonusCount = 0, guaranteeType
    } = data;

    const userTier = await getUserTier(user.id);

    const prompt = `You are an expert affiliate marketing analyst specializing in WarriorPlus, JVZoo, and ClickBank launches. Analyze this product and predict its affiliate performance.

Product Details:
- Name: ${productName || 'Unnamed Product'}
- Niche: ${niche}
- Product Type: ${productType}
- Target Audience: ${targetAudience || 'MMO/Digital Product Buyers'}
- Front-End Price: $${frontEndPrice}
- Commission: ${commissionPercent}%
- Has Upsells: ${hasUpsells}
- Upsell Prices: ${upsellPrices.length > 0 ? (upsellPrices as number[]).map(p => '$' + p).join(', ') : 'None'}
- Bonus Count: ${bonusCount}
- Guarantee: ${guaranteeType || 'Not specified'}
- Offer Summary: ${offerSummary || 'Not provided'}

Analyze and return ONLY valid JSON:
{
  "scores": {
    "epcPotential": 8.5,
    "conversionStrength": 7.8,
    "offerAppeal": 9.1,
    "commissionPower": 8.0,
    "refundRisk": 2.5,
    "buyerAppeal": 8.7
  },
  "overallScore": 86,
  "verdict": "strong",
  "verdictMessage": "One sentence summary of affiliate attractiveness",
  "projections": {
    "estimatedEPC": 1.75,
    "conversionRangeMin": 2.4,
    "conversionRangeMax": 4.1,
    "averageCartValue": 41,
    "estimatedRefundRate": 8,
    "affiliateEarningsPerSale": 8.50,
    "top10AffiliateEarnings": 5300,
    "top25AffiliateEarnings": 2700,
    "top50AffiliateEarnings": 1500
  },
  "optimizations": [
    {
      "action": "Specific optimization suggestion",
      "impact": "Expected impact description",
      "priority": "high"
    }
  ],
  "commissionAdvice": {
    "currentStructure": "50% on $17 FE",
    "recommendedStructure": "What the ideal commission structure should be",
    "reasoning": "Why this change would attract more affiliates",
    "projectedImpact": "How much this could increase affiliate recruitment"
  },
  "affiliateSwipeSuggestions": {
    "subjectLines": [
      "High-converting email subject line 1",
      "High-converting email subject line 2",
      "High-converting email subject line 3"
    ],
    "angleRecommendation": "The best promotion angle for affiliates to use"
  },
  "leaderboardSimulation": {
    "prizePool": "$500 / $250 / $100",
    "projectedContestEntries": 45,
    "topAffiliateProjection": "$5,300 in commissions",
    "midTierProjection": "$800-1,500 in commissions"
  },
  "competitivePosition": {
    "nicheAvgEPC": 1.20,
    "nicheAvgConversion": 2.8,
    "positionVsAverage": "above",
    "standoutFactors": ["Factor 1", "Factor 2"]
  }
}

SCORING RULES:
- All scores 0-10 (higher = better, except refundRisk where lower = better)
- overallScore = weighted average * 10, capped at 100
- verdict: "strong" if >= 75, "moderate" if >= 50, "weak" if < 50
- estimatedEPC should be realistic for this price point and niche
- refund rate estimates should reflect the niche (MMO typically 8-15%)
- Be honest and specific, not generic
- optimizations should have 3-5 entries with "high", "medium", or "low" priority`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Unable to generate affiliate prediction. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
