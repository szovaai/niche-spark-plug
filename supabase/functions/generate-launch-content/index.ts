import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

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
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const prompt = `Generate a complete product outline for a digital product.

Product: ${productBrief.title}
Subtitle: ${productBrief.subtitle}
Concept: ${productBrief.concept}
Type: ${productType || "ebook"}
Unique Mechanism: ${productBrief.uniqueMechanism}
Pain Points: ${productBrief.painPoints?.join(", ") || ""}

Return ONLY valid JSON:
{
  "outline": "2-3 paragraph overview — open with the reader's problem, introduce the mechanism, then outline the transformation path",
  "chapters": [
    { "title": "Action-oriented chapter title with specific outcome", "summary": "2-3 sentences: what they'll learn and the result they'll get", "keyPoints": ["specific actionable point 1", "point 2", "point 3"] }
  ],
  "bonuses": ["Bonus 1: [Name] — specific description of what it is and the result it produces", "Bonus 2: ...", "Bonus 3: ..."],
  "description": "A compelling 150-word product description — lead with pain, introduce mechanism, promise specific result"
}

RULES:
- Generate 6-8 chapters, each building on the previous one
- Every chapter title must promise a specific outcome (not just a topic name)
- Bonuses must be named products with clear value, not vague "extra resources"
- Reference the unique mechanism "${productBrief.uniqueMechanism}" throughout
- The description must read like sales copy, not a table of contents`;

    const { content, model } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-content", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate content. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
