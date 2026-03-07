import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { AD_COPY_SYSTEM, EMAIL_SEQUENCE_SYSTEM, AFFILIATE_KIT_SYSTEM } from "../_shared/copyPrompts.ts";

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
      { field: 'price', type: 'number', maxLength: 100 },
      { field: 'buyerAvatar', type: 'object', maxLength: 10000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productContent, funnelCopy, buyerAvatar } = data;
    const price = data.price || 17;

    const cacheKey = `launch-marketing-${(productBrief as any).title?.slice(0, 50)}-${price}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const selectedAngle = productBrief.selectedAngle || "";
    const angleInstruction = selectedAngle ? `\nCAMPAIGN ANGLE: "${selectedAngle}" — weave this angle into all content.` : "";
    const avatarContext = buyerAvatar
      ? `\nBUYER AVATAR: ${(buyerAvatar as any).personaName} — ${(buyerAvatar as any).occupation}. Pain: ${(buyerAvatar as any).painPoints?.join(", ")}. Language: ${(buyerAvatar as any).languageTheyUse?.join(", ")}. Fear: ${(buyerAvatar as any).biggestFear}`
      : '';

    const mechanismInstruction = productBrief.uniqueMechanism ? `\nMECHANISM: Reference "${productBrief.uniqueMechanism}" in ad copy, email subject lines, and social posts.` : "";

    const prompt = `Generate a complete marketing asset kit for this digital product launch.

PRODUCT: ${productBrief.title} — ${productBrief.subtitle}
CONCEPT: ${productBrief.concept}
UNIQUE MECHANISM: ${productBrief.uniqueMechanism}
PAIN POINTS: ${productBrief.painPoints?.join(", ")}
DESCRIPTION: ${productContent?.description || ""}
FRONT-END PRICE: $${price}
COMMISSION: 50-75%${angleInstruction}${mechanismInstruction}${avatarContext}

Return ONLY valid JSON:
{
  "emails": [
    { "subject": "Under 50 chars — curiosity or specific result", "body": "Full email body. Max 300 words. Open with a hook (question, bold statement, story fragment). End with ONE specific CTA. Never use corporate openers." }
  ],
  "socialPosts": ["Post with hook, value, and hashtags", "...up to 10 posts"],
  "pinterestPins": ["Pin description with keywords", "Pin 2", "Pin 3", "Pin 4", "Pin 5"],
  "blogArticle": "600-word article: provide real value related to the topic, naturally lead to the product. Use headers and formatting.",
  "videoScript": "2-minute script: Hook (10s) → Problem (20s) → Solution intro (15s) → Product walkthrough (45s) → CTA (15s) → Outro (15s). Speaker directions in brackets.",
  "adCopy": [
    { "headline": "Under 40 chars, specific result", "primaryText": "Hook → pain → solution → CTA. Max 5 sentences. Must stop the scroll.", "cta": "Get Instant Access", "hookAngle": "Speed" },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "Skeptic" },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "Simplicity" },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "Result" },
    { "headline": "...", "primaryText": "...", "cta": "...", "hookAngle": "Curiosity" }
  ],
  "targetingKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7", "keyword 8"],
  "affiliateKit": {
    "headline": "Why affiliates should promote this over everything else this week — specific conversion data",
    "emailSwipes": [
      { "subject": "Under 50 chars", "body": "Direct benefit-led swipe. Under 250 words. Ends with [YOUR AFFILIATE LINK]" },
      { "subject": "...", "body": "Story-led swipe. Ends with [YOUR AFFILIATE LINK]" },
      { "subject": "...", "body": "Urgency/scarcity swipe. Ends with [YOUR AFFILIATE LINK]" }
    ],
    "promoAngles": ["Angle 1 with specific hook", "Angle 2", "Angle 3"],
    "bonusPageHeadline": "Headline for affiliate bonus page",
    "jvPageCopy": "Complete JV recruitment page. Include: 50-75% commission on $${price} FE, product description, why this converts, what affiliates get (swipes, banners, bonuses). 300+ words."
  }
}

EMAIL STRUCTURE (generate exactly 5):
1. Pre-launch teaser: curiosity + specific promise within 24 hours
2. Launch announcement: bold claim + mechanism name + CTA
3. Value-add: share one key insight from the product
4. Objection handler: address the #1 reason people don't buy
5. Last chance: urgency close with specific deadline

AD RULES:
- Speed angle: "In 24 hours from now..."
- Skeptic angle: "I know you've heard this before, but..."
- Simplicity angle: "You don't need experience, a following, or tech skills..."
- Result angle: lead with the specific outcome first
- Curiosity angle: tease the mechanism without revealing it`;

    const { content, model } = await callTieredAI([
      { role: "system", content: `${AD_COPY_SYSTEM}\n\n${EMAIL_SEQUENCE_SYSTEM}\n\n${AFFILIATE_KIT_SYSTEM}` },
      { role: "user", content: prompt },
    ], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      const raw = jsonMatch[0];
      let depth = 0, lastValid = -1;
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] === '{') depth++;
        else if (raw[i] === '}') { depth--; if (depth === 0) { lastValid = i; break; } }
      }
      if (lastValid > 0) result = JSON.parse(raw.slice(0, lastValid + 1));
      else throw parseErr;
    }

    await setCachedResponse(cacheKey, "generate-launch-marketing", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate marketing assets. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
