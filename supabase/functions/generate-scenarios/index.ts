import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const { productTitle, niche, targetAudience, promisedResult, uniqueMechanism } = await req.json();
    const userTier = await getUserTier(user.id);

    const prompt = `You are a digital product strategist. Generate 5 detailed, realistic client/customer scenario walkthroughs for a digital product.

PRODUCT: ${productTitle || "Unknown"}
NICHE: ${niche || "General"}
TARGET AUDIENCE: ${targetAudience || "Beginners"}
PROMISED RESULT: ${promisedResult || "Not defined"}
UNIQUE MECHANISM: ${uniqueMechanism || ""}

Each scenario must show a REAL, BELIEVABLE example of someone using this product and getting a result.

Return ONLY valid JSON:
{
  "scenarios": [
    {
      "clientType": "Specific type of person/business (e.g., 'Local roofing company owner')",
      "name": "A realistic first name",
      "problem": "Their specific problem before the product (2-3 sentences)",
      "action": "Exactly what they did with the product step-by-step (3-4 sentences)",
      "exampleOutput": "A specific sample of what they created/delivered (e.g., an actual post, email, or offer)",
      "outreachMessage": "The exact message they sent to get the result",
      "result": "Specific measurable result with numbers and timeframe (e.g., 'Landed a $150/month retainer within 5 days')",
      "timeToResult": "How long it took (e.g., '4 days')"
    }
  ],
  "transformationSummary": {
    "before": "Who the buyer is before (confused, stuck, no clear path)",
    "after": "Who they become after (confident, equipped, taking action with results)"
  }
}

RULES:
- Generate exactly 5 scenarios
- Each scenario must be for a DIFFERENT type of client/situation
- Use realistic dollar amounts ($50-$500 range for first results)
- Include specific timeframes (hours, days — not months)
- The exampleOutput must be actual content they could copy, not a description of content
- The outreachMessage must be a real message they could send
- Make each scenario feel achievable for a complete beginner`;

    const { content } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate scenarios." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
