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
      { field: 'niche', type: 'string', required: true, maxLength: 200 },
      { field: 'targetAudience', type: 'string', maxLength: 500 },
      { field: 'productType', type: 'string', required: true, maxLength: 100 },
      { field: 'topic', type: 'string', required: true, maxLength: 500 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, targetAudience, productType, topic } = data;

    const cacheKey = `launch-product-${niche}-${productType}-${topic}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const prompt = `Create a compelling product concept for a digital product launch.

Niche: ${niche}
Target Audience: ${targetAudience || "General audience"}
Product Type: ${productType}
Topic: ${topic}

Return ONLY valid JSON:
{
  "title": "Catchy product title with a specific promise",
  "subtitle": "Compelling subtitle that disarms the biggest objection",
  "concept": "2-3 sentence product concept — lead with the pain it solves, then the specific outcome",
  "uniqueMechanism": "A named, proprietary-sounding framework (e.g. 'The 24-Hour Service Velocity Framework')",
  "painPoints": ["specific pain 1 with emotional detail", "pain 2", "pain 3", "pain 4", "pain 5"],
  "mechanisms": [
    { "name": "The [Adjective] [Noun] [Method/Protocol/System/Framework]", "tagline": "Specific result + timeframe in one sentence", "description": "2 sentences: how it works and why it's different from everything else" },
    { "name": "...", "tagline": "...", "description": "..." },
    { "name": "...", "tagline": "...", "description": "..." }
  ],
  "campaignAngles": [
    { "name": "Speed", "hook": "A scroll-stopping hook with a specific timeframe or number", "description": "2 sentences on why this angle resonates" },
    { "name": "Simplicity", "hook": "A scroll-stopping hook emphasizing ease", "description": "..." },
    { "name": "Results", "hook": "A scroll-stopping hook leading with a specific outcome", "description": "..." }
  ]
}

CRITICAL RULES:
- Every mechanism name must sound proprietary and branded (e.g. "The Rapid Launch Protocol", "The AI Funnel Sprint")
- Every hook must contain a number, timeframe, or specific result — NEVER vague promises
- Pain points must be emotionally specific — describe the exact frustration, not a generic problem
- Campaign angles should trigger completely different emotions (speed, fear of missing out, simplicity)`;

    const { content, model } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-product", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate product. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
