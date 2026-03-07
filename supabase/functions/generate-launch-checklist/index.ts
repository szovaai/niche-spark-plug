import { corsHeaders } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productBrief, hasContent, hasFunnel, hasMarketing, userId } = await req.json();

    const userTier = userId ? await getUserTier(userId) : "free";

    const prompt = `You are a launch strategist. Generate a personalized launch checklist for a digital product.

Product: ${productBrief?.title || "Digital Product"}
Has product content: ${hasContent ? "Yes" : "No"}
Has funnel copy: ${hasFunnel ? "Yes" : "No"}
Has marketing assets: ${hasMarketing ? "Yes" : "No"}

Return ONLY valid JSON:
{
  "steps": [
    { "id": "step-1", "title": "Step title", "description": "Brief actionable description", "completed": false }
  ]
}

Generate 8-12 launch steps in logical order. Steps should include things like: finalize product, set up sales page, configure payment, load email sequence, create opt-in page, test purchase flow, soft launch to warm audience, announce launch, share on social, follow up with buyers, gather testimonials, iterate based on feedback.

Mark steps as completed=true if the user already has that asset generated (e.g. if hasContent is true, mark "finalize product" as completed).`;

    const { content } = await callTieredAI([{ role: "user", content: prompt }], userTier, "simple");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
