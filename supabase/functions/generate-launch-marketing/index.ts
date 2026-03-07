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
      { field: 'productContent', type: 'object', maxLength: 50000 },
      { field: 'funnelCopy', type: 'object', maxLength: 50000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productContent, funnelCopy } = data;

    const cacheKey = `launch-marketing-${(productBrief as any).title?.slice(0, 50)}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const selectedAngle = productBrief.selectedAngle || "";
    const angleInstruction = selectedAngle ? `\nIMPORTANT: Use the "${selectedAngle}" campaign angle as the primary messaging theme. All content should reinforce this angle consistently.` : "";
    const mechanismInstruction = productBrief.uniqueMechanism ? `\nIMPORTANT: Reference the unique mechanism "${productBrief.uniqueMechanism}" in ad copy, email subject lines, and social posts.` : "";

    const prompt = `${HUMAN_TONE}

You are a digital marketing expert. Generate a complete marketing asset kit for this product launch.

Product: ${productBrief.title} — ${productBrief.subtitle}
Concept: ${productBrief.concept}
Unique Mechanism: ${productBrief.uniqueMechanism}
Pain Points: ${productBrief.painPoints?.join(", ")}
Description: ${productContent?.description || ""}${angleInstruction}${mechanismInstruction}

Return ONLY valid JSON:
{
  "emails": [
    { "subject": "Email subject line", "body": "Full email body with greeting, value, CTA. 150-200 words." }
  ],
  "socialPosts": ["Post 1 text with hashtags", "Post 2 text", "...up to 10 posts"],
  "pinterestPins": ["Pin description 1 with keywords", "Pin 2", "Pin 3", "Pin 4", "Pin 5"],
  "blogArticle": "A complete 600-word blog article that provides value related to the product topic and naturally leads to the product as a solution. Use markdown formatting with headers.",
  "videoScript": "A 2-minute YouTube video script with: Hook (10s), Problem (20s), Solution intro (15s), Product walkthrough (45s), CTA (15s), Outro (15s). Include speaker directions in brackets.",
  "adCopy": [
    { "headline": "Ad headline under 40 chars", "primaryText": "Facebook/Instagram ad primary text 125 words max. Hook, problem, solution, CTA.", "cta": "CTA button text", "hookAngle": "Name of the angle used" },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "..." },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "..." },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "..." },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "..." }
  ],
  "targetingKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7", "keyword 8"],
  "affiliateKit": {
    "headline": "A compelling JV page headline that makes affiliates excited to promote",
    "emailSwipes": [
      { "subject": "Affiliate email swipe subject 1", "body": "Ready-to-send email for affiliates to promote. 150 words." },
      { "subject": "Affiliate email swipe subject 2", "body": "Different angle affiliate email. 150 words." },
      { "subject": "Affiliate email swipe subject 3", "body": "Urgency-based affiliate email. 150 words." }
    ],
    "promoAngles": ["Promo angle 1 affiliates can use", "Promo angle 2", "Promo angle 3"],
    "bonusPageHeadline": "A headline for an affiliate bonus page",
    "jvPageCopy": "Complete JV/affiliate recruitment page copy. Include: commission rate (50-75%), product description, conversion stats placeholder, why this converts, what affiliates get (swipes, banners, bonuses). 300+ words with markdown formatting."
  }
}

Generate exactly 5 emails (pre-launch teaser, launch announcement, value-add, objection handler, last chance).
Generate exactly 10 social posts (mix of educational, promotional, and engagement).
Generate exactly 5 ad variations — each with a DIFFERENT hook angle (curiosity, fear, social proof, urgency, aspiration).`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-marketing", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate marketing assets. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
