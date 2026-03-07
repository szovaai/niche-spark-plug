import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { SALES_PAGE_SYSTEM, OTO_UPSELL_SYSTEM } from "../_shared/copyPrompts.ts";

function extractAndRepairJson(content: string): unknown {
  // Remove markdown code blocks
  let cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find JSON boundaries
  const jsonStart = cleaned.search(/[\{\[]/);
  if (jsonStart === -1) throw new Error("No JSON found in response");

  const opener = cleaned[jsonStart];
  const closer = opener === '{' ? '}' : ']';

  // Find last matching closer
  const jsonEnd = cleaned.lastIndexOf(closer);
  if (jsonEnd === -1) throw new Error("No closing bracket found");

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    // Repair: strip control chars, fix trailing commas
    cleaned = cleaned
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    try {
      return JSON.parse(cleaned);
    } catch (_e2) {
      // Count unbalanced braces/brackets (string-aware)
      let braces = 0, brackets = 0, inString = false, escape = false;
      for (const char of cleaned) {
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (char === '{') braces++;
        else if (char === '}') braces--;
        else if (char === '[') brackets++;
        else if (char === ']') brackets--;
      }

      let repaired = cleaned;
      while (brackets > 0) { repaired += ']'; brackets--; }
      while (braces > 0) { repaired += '}'; braces--; }

      try {
        return JSON.parse(repaired);
      } catch (finalErr) {
        console.error("JSON repair failed, raw content (first 500):", content.slice(0, 500));
        throw new Error("Could not extract valid JSON from AI response");
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();

    // Handle optimization mode
    if (body.optimizationMode && body.existingSalesPage) {
      const userTier = await getUserTier(user.id);
      const optimizePrompt = `You are optimizing an existing sales page for higher conversions. 

EXISTING SALES PAGE:
${body.existingSalesPage.slice(0, 8000)}

MISSING CONVERSION ELEMENTS:
${body.missingElements}

INSTRUCTIONS:
- Keep ALL existing copy intact
- ADD the missing elements naturally into the sales page
- Maintain the same tone, voice, and style
- Return the COMPLETE sales page with additions woven in

Return ONLY valid JSON with the same structure as the original funnel:
{
  "salesPage": "The complete optimized sales page copy with missing elements added",
  "optInPage": "Keep existing or generate if missing",
  "thankYouPage": "Keep existing or generate if missing",
  "bonusPage": "Keep existing or generate if missing",
  "checkoutCopy": "Keep existing or generate if missing"
}`;

      const { content } = await callTieredAI([
        { role: "system", content: SALES_PAGE_SYSTEM },
        { role: "user", content: optimizePrompt },
      ], userTier, "standard");

      const result = extractAndRepairJson(content);

      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { valid, error: valError, data } = validateInput(body, [
      { field: 'productBrief', type: 'object', required: true, maxLength: 10000 },
      { field: 'productContent', type: 'object', maxLength: 50000 },
      { field: 'price', type: 'number', maxLength: 100 },
      { field: 'buyerAvatar', type: 'object', maxLength: 10000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productContent, buyerAvatar } = data;
    const price = data.price || 17;

    const cacheKey = `launch-funnel-${(productBrief as any).title?.slice(0, 50)}-${price}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const chapterTitles = productContent?.chapters?.map((c: any) => c.title).join(", ") || "N/A";
    const selectedAngle = productBrief.selectedAngle || "";
    const angleInstruction = selectedAngle ? `\nCAMPAIGN ANGLE: Use "${selectedAngle}" as the primary messaging theme across all copy.` : "";
    const avatarContext = buyerAvatar
      ? `\nBUYER AVATAR: ${(buyerAvatar as any).personaName} — ${(buyerAvatar as any).occupation}. Frustration: ${(buyerAvatar as any).dailyFrustration}. Fear: ${(buyerAvatar as any).biggestFear}. Dream: ${(buyerAvatar as any).secretDream}. Pain points: ${(buyerAvatar as any).painPoints?.join(", ")}. Language: ${(buyerAvatar as any).languageTheyUse?.join(", ")}`
      : '';

    const mechanismInstruction = productBrief.uniqueMechanism ? `\nUNIQUE MECHANISM: "${productBrief.uniqueMechanism}" — reference this named framework in headlines, benefits, and CTAs.` : "";

    const prompt = `Generate complete funnel copy AND objection handling for this digital product.

PRODUCT: ${productBrief.title} — ${productBrief.subtitle}
CONCEPT: ${productBrief.concept}
UNIQUE MECHANISM: ${productBrief.uniqueMechanism}
PAIN POINTS: ${productBrief.painPoints?.join(", ")}
CHAPTERS: ${chapterTitles}
DESCRIPTION: ${productContent?.description || ""}
FRONT-END PRICE: $${price}${angleInstruction}${mechanismInstruction}${avatarContext}

Return ONLY valid JSON:
{
  "salesPage": "Complete long-form sales page following the Dan Kennedy structure: pre-headline → main headline (specific result + timeframe) → subheadline → pain agitation → 'what nobody tells you' → product intro with mechanism → feature-to-benefit breakdown → what's included → named guarantee → price justification (anchor against $${price * 20}+ alternatives before revealing $${price}) → urgency close → two kinds of people → FAQ (5 questions). Minimum 800 words.",
  "optInPage": "Opt-in page: headline with specific result, 3 bullet benefits with numbers, CTA: 'Yes — Send Me The Free [Lead Magnet Name]'. Lead magnet angle tied to product.",
  "thankYouPage": "Thank you page: confirm purchase, specific next step to take RIGHT NOW, surprise bonus mention.",
  "bonusPage": "Bonus page: 3 exclusive bonuses with names, specific descriptions, and individual perceived values.",
  "checkoutCopy": "Checkout page copy: order summary emphasizing the $${price} price vs total value, urgency element, trust text.",
  "orderBump": "Order bump ($${Math.min(price, 12)} add-on): product name, 2-3 sentence description of what it is, why they need it NOW, compelling reason to add it. Must feel like a no-brainer impulse add.",
  "upsellOffer": "One-time upsell at $${Math.round(price * 2.5)}: congratulations opener → the gap → what this includes → transformation → original price $${Math.round(price * 8)} vs special $${Math.round(price * 2.5)} → urgency → CTA: 'Yes — Upgrade Me Now' / 'No thanks, I'll do it the slow way'.",
  "offerStack": {
    "coreProduct": { "name": "${productBrief.title}", "value": ${Math.round(price * 15)} },
    "bonuses": [
      { "name": "Bonus Name", "description": "What it is and specific result it produces", "value": ${Math.round(price * 5)} },
      { "name": "Bonus Name", "description": "...", "value": ${Math.round(price * 4)} },
      { "name": "Bonus Name", "description": "...", "value": ${Math.round(price * 3)} }
    ],
    "totalValue": ${Math.round(price * 27)},
    "askingPrice": ${price},
    "stackCopy": "Formatted value stack copy showing each item with its value, total crossed out, and today's price of $${price}."
  },
  "objections": [
    {
      "objection": "Common buyer objection phrased as they would say it",
      "reframe": "Reframe that turns this objection into a reason TO buy — specific, not generic",
      "proof": "Specific evidence, stat, or logical argument that counters this objection",
      "followUpQuestion": "Question that moves them toward the sale after addressing the objection"
    }
  ]
}

CRITICAL:
- The sales page MUST justify the $${price} price by anchoring against expensive alternatives BEFORE revealing the price
- The guarantee must be named and bold (e.g. "The 30-Day 'Use It Or Lose Nothing' Guarantee")
- Every CTA must include the product name
- The upsell page must feel like momentum, not a hard sell
- No generic phrases — every benefit must be specific and measurable
- Generate exactly 8 objections covering: price concern, skepticism about results, "I've tried before", time concern, trust concern, "not for me", technical ability, and delayed action
- Each objection reframe must be specific to THIS product, not generic sales advice`;

    const { content, model } = await callTieredAI([
      { role: "system", content: SALES_PAGE_SYSTEM },
      { role: "user", content: prompt },
    ], userTier, "complex");

    const result = extractAndRepairJson(content);

    await setCachedResponse(cacheKey, "generate-launch-funnel", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate funnel. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
