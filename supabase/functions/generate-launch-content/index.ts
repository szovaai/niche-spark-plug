import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";

const HUMAN_TONE = `Write like a real person — use contractions, vary sentence length, add personality. Sound confident but not salesy. Avoid corporate buzzwords.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'productBrief', type: 'object', required: true, maxLength: 10000 },
      { field: 'productType', type: 'string', maxLength: 100 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productType } = data;

    const cacheKey = `launch-content-${JSON.stringify(productBrief).slice(0, 100)}`;
    const cached = await getCachedResponse(cacheKey, "generate-launch-content");
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const prompt = `${HUMAN_TONE}

You are a digital product creator. Generate a complete product outline.

Product: ${productBrief.title}
Subtitle: ${productBrief.subtitle}
Concept: ${productBrief.concept}
Type: ${productType || "ebook"}
Unique Angle: ${productBrief.uniqueMechanism}

Return ONLY valid JSON:
{
  "outline": "A 2-3 paragraph overview of the entire product structure",
  "chapters": [
    { "title": "Chapter title", "summary": "2-3 sentence chapter summary", "keyPoints": ["key point 1", "key point 2", "key point 3"] }
  ],
  "bonuses": ["Bonus idea 1 with description", "Bonus idea 2 with description", "Bonus idea 3 with description"],
  "description": "A compelling 150-word product description ready for a sales listing"
}

Generate 6-8 chapters. Each chapter should be actionable and build on the previous one.`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-content", result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate content. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
