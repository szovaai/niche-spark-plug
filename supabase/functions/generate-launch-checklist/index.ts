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
      { field: 'productBrief', type: 'object', maxLength: 10000 },
      { field: 'hasContent', type: 'boolean' },
      { field: 'hasFunnel', type: 'boolean' },
      { field: 'hasMarketing', type: 'boolean' },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, hasContent, hasFunnel, hasMarketing } = data;

    const userTier = await getUserTier(user.id);

    const prompt = `You are a launch strategist. Generate a personalized day-by-day launch timeline for a digital product.

Product: ${(productBrief as any)?.title || "Digital Product"}
Has product content: ${hasContent ? "Yes" : "No"}
Has funnel copy: ${hasFunnel ? "Yes" : "No"}
Has marketing assets: ${hasMarketing ? "Yes" : "No"}

Return ONLY valid JSON:
{
  "steps": [
    { "id": "step-1", "title": "Step title", "description": "Brief actionable description", "completed": false, "day": 1 }
  ]
}

Generate 10-14 launch steps organized into a 7-day launch timeline. Group steps by day:
- Day 1: Finalize product, set up delivery
- Day 2: Build sales page, configure payment
- Day 3: Set up email sequence, create opt-in page
- Day 4: Test purchase flow, prepare social media
- Day 5: Soft launch to warm audience, gather early feedback
- Day 6: Official launch, announce everywhere
- Day 7: Follow up with buyers, gather testimonials, iterate

Mark steps as completed=true if the user already has that asset generated (e.g. if hasContent is true, mark product-related steps as completed).
Each day should have 1-3 steps. Assign the "day" field (1-7) to each step.`;

    const { content } = await callTieredAI([{ role: "user", content: prompt }], userTier, "simple");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate checklist. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
