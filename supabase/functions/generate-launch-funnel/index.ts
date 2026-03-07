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
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productContent } = data;

    const cacheKey = `launch-funnel-${(productBrief as any).title?.slice(0, 50)}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const chapterTitles = productContent?.chapters?.map((c: any) => c.title).join(", ") || "N/A";
    const selectedAngle = productBrief.selectedAngle || "";
    const angleInstruction = selectedAngle ? `\nIMPORTANT: Use the "${selectedAngle}" campaign angle as the primary messaging theme across all copy. Every section should reinforce this angle.` : "";
    const mechanismInstruction = productBrief.uniqueMechanism ? `\nIMPORTANT: The product's unique mechanism is "${productBrief.uniqueMechanism}". Reference this named framework throughout the copy — in headlines, benefits, and CTAs.` : "";

    const prompt = `${HUMAN_TONE}

You are an expert copywriter. Generate complete funnel copy for this digital product.

Product: ${productBrief.title} — ${productBrief.subtitle}
Concept: ${productBrief.concept}
Unique Mechanism: ${productBrief.uniqueMechanism}
Pain Points: ${productBrief.painPoints?.join(", ")}
Chapters: ${chapterTitles}
Description: ${productContent?.description || ""}${angleInstruction}${mechanismInstruction}

Return ONLY valid JSON:
{
  "salesPage": "Full sales page copy with headline, subheadline, problem section, solution section, what's inside, benefits, testimonial placeholders, CTA sections, and guarantee. Use markdown formatting.",
  "optInPage": "Opt-in page copy with headline, 3 bullet benefits, and CTA. Include a free lead magnet angle.",
  "thankYouPage": "Thank you page copy confirming their purchase/opt-in with next steps and a surprise bonus mention.",
  "bonusPage": "Bonus page copy highlighting 3 exclusive bonuses they get with their purchase.",
  "checkoutCopy": "Checkout page copy with order summary, urgency element, and trust badges text.",
  "orderBump": "Order bump copy for the checkout page — a complementary low-price add-on offer ($7-$17). Include: product name, 2-3 sentence description of what it is, why they need it NOW, and a compelling reason to add it.",
  "upsellOffer": "One-time upsell offer copy shown after purchase. Include: upsell product name, what it includes, the transformation it provides, original price vs special price, urgency element, and CTA.",
  "offerStack": {
    "coreProduct": { "name": "Product name", "value": 297 },
    "bonuses": [
      { "name": "Bonus 1 Name", "description": "What it is and why it's valuable", "value": 97 },
      { "name": "Bonus 2 Name", "description": "What it is and why it's valuable", "value": 67 },
      { "name": "Bonus 3 Name", "description": "What it is and why it's valuable", "value": 47 }
    ],
    "totalValue": 508,
    "askingPrice": 17,
    "stackCopy": "Formatted value stack copy ready for a sales page, showing each item with its value, total value crossed out, and today's price."
  }
}

Make each section comprehensive — at least 300 words for salesPage, 150+ for upsellOffer and orderBump, 100+ for others.
The offerStack values should feel realistic and compelling. The askingPrice should be a fraction of totalValue to create irresistible perceived value.`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("JSON parse error, attempting cleanup");
      // Try to fix common truncation issues by finding the last valid closing brace
      const raw = jsonMatch[0];
      let depth = 0;
      let lastValid = -1;
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] === '{') depth++;
        else if (raw[i] === '}') { depth--; if (depth === 0) { lastValid = i; break; } }
      }
      if (lastValid > 0) {
        result = JSON.parse(raw.slice(0, lastValid + 1));
      } else {
        throw parseErr;
      }
    }

    await setCachedResponse(cacheKey, "generate-launch-funnel", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate funnel. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
