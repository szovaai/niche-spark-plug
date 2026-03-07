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
      { field: 'scrapedContent', type: 'string', required: true, maxLength: 50000 },
      { field: 'url', type: 'string', maxLength: 2000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { scrapedContent, url } = data;

    const userTier = await getUserTier(user.id);

    const truncated = (scrapedContent as string).slice(0, 8000);

    const prompt = `You are an expert at analyzing digital product launches and sales funnels. Analyze this product page and reverse-engineer the launch strategy.

URL: ${url || "Unknown"}
Page Content:
${truncated}

Analyze the offer and return ONLY valid JSON:
{
  "productName": "The product name",
  "detectedAngle": "The primary sales angle used (e.g., Speed, Authority, Fear, Simplicity)",
  "pricingStrategy": "Description of pricing approach (e.g., low-ticket tripwire, premium, value stack)",
  "funnelStructure": "Description of the funnel flow detected (e.g., sales page → order bump → upsell)",
  "offerBreakdown": {
    "mainProduct": "What the core product is",
    "bonuses": ["Bonus 1", "Bonus 2"],
    "pricePoint": "Detected or estimated price",
    "valueStack": "Total perceived value if mentioned"
  },
  "strengths": ["What this launch does well 1", "What this launch does well 2"],
  "weaknesses": ["Exploitable gap 1", "Exploitable gap 2"],
  "alternativeAngles": [
    { "name": "Angle name", "description": "How you could use this angle to compete" },
    { "name": "Angle name", "description": "How you could use this angle to compete" },
    { "name": "Angle name", "description": "How you could use this angle to compete" }
  ],
  "counterPositioning": "A 2-3 sentence strategy for how to build a competing product that differentiates from this one",
  "suggestedNiche": "The niche this product targets",
  "suggestedAudience": "The target audience",
  "suggestedTopic": "A competing topic you could use in the wizard"
}`;

    const { content } = await callTieredAI([{ role: "user", content: prompt }], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to analyze competitor. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
