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
      { field: 'buyerAvatar', type: 'object', maxLength: 10000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productType, buyerAvatar } = data;

    const cacheKey = `launch-content-${JSON.stringify(productBrief).slice(0, 100)}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const avatarContext = buyerAvatar
      ? `\nBUYER AVATAR — Write for this specific person:\nName: ${(buyerAvatar as any).personaName}\nFrustration: ${(buyerAvatar as any).dailyFrustration}\nDesires: ${(buyerAvatar as any).desires?.join(", ")}\nPain Points: ${(buyerAvatar as any).painPoints?.join(", ")}\nLanguage: ${(buyerAvatar as any).languageTheyUse?.join(", ")}`
      : '';

    const prompt = `Generate a complete product outline AND a proof/credibility stack for a digital product.${avatarContext}

Product: ${productBrief.title}
Subtitle: ${productBrief.subtitle}
Concept: ${productBrief.concept}
Type: ${productType || "ebook"}
Unique Mechanism: ${productBrief.uniqueMechanism}
Pain Points: ${productBrief.painPoints?.join(", ") || ""}

Return ONLY valid JSON:
{
  "outline": "2-3 paragraph overview — open with the reader's problem, introduce the mechanism, then outline the transformation path. Write conversationally — like you're explaining this to a friend over coffee.",
  "chapters": [
    { "title": "Action-oriented chapter title with specific outcome", "summary": "2-3 sentences: what they'll learn and the result they'll get. Be specific — not 'learn marketing' but 'set up your first $7 tripwire that converts cold traffic'", "keyPoints": ["specific actionable point 1", "point 2", "point 3"] }
  ],
  "bonuses": ["Bonus 1: [Name] — specific description of what it is and the result it produces", "Bonus 2: ...", "Bonus 3: ..."],
  "description": "A compelling 150-word product description — lead with pain, introduce mechanism, promise specific result. Write like a human, not a brochure.",
  "proofStack": {
    "testimonialTemplates": [
      {
        "name": "[TESTIMONIAL 1 — Replace with real customer]",
        "before": "What life/work was like BEFORE using the product — specific frustration in buyer's language",
        "product": "What they did with the product — specific action they took",
        "result": "The specific measurable result they achieved — numbers, timeframes",
        "lifeNow": "How their situation is different now — emotional + practical change"
      }
    ],
    "beforeAfterTable": [
      { "before": "Specific pain state in buyer's own words", "after": "Specific transformed state with measurable difference" }
    ],
    "credibilityBuilder": "2-3 paragraphs of honest credibility copy for someone who may not have testimonials yet. Use frameworks like: 'I spent X months researching...', 'After interviewing X people...', 'I tested every method I could find and distilled it down to...' — builds trust without fake claims.",
    "earningsDisclaimer": "FTC-compliant earnings/results disclaimer customized to this product type. Include: results not typical, individual results vary, no guarantee of specific outcomes. Professional but not scary.",
    "quickWinsList": [
      "Specific tangible outcome #1 the buyer gets (e.g., 'Get 3 ready-to-send email sequences you can deploy TODAY')",
      "Specific tangible outcome #2",
      "Specific tangible outcome #3",
      "Specific tangible outcome #4",
      "Specific tangible outcome #5",
      "Specific tangible outcome #6",
      "Specific tangible outcome #7"
    ]
  }
}

RULES:
- Generate 6-8 chapters, each building on the previous one
- Every chapter title must promise a specific outcome (not just a topic name)
- Bonuses must be named products with clear value, not vague "extra resources"
- Reference the unique mechanism "${productBrief.uniqueMechanism}" throughout
- The description must read like sales copy, not a table of contents
- Write in a warm, direct, conversational tone — like a knowledgeable friend who's already done this
- Generate exactly 5 testimonial templates covering: skeptic-turned-believer, beginner success, unexpected benefit, best result story, quick win story
- Generate 5-7 before/after rows showing real transformations in buyer's language
- Quick wins must be SPECIFIC and TANGIBLE — not "learn mindset" but "Get a done-for-you checklist you can use in the next 10 minutes"`;

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
