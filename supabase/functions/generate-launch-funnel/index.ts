import { corsHeaders } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";

const HUMAN_TONE = `Write like a real person — use contractions, vary sentence length, add personality. Sound confident but not salesy. Avoid corporate buzzwords.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productBrief, productContent, userId } = await req.json();

    if (!productBrief) {
      return new Response(JSON.stringify({ error: "Missing product brief" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const cacheKey = `launch-funnel-${productBrief.title?.slice(0, 50)}`;
    const cached = await getCachedResponse(cacheKey, "generate-launch-funnel");
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = userId ? await getUserTier(userId) : "free";

    const chapterTitles = productContent?.chapters?.map((c: any) => c.title).join(", ") || "N/A";

    const prompt = `${HUMAN_TONE}

You are an expert copywriter. Generate complete funnel copy for this digital product.

Product: ${productBrief.title} — ${productBrief.subtitle}
Concept: ${productBrief.concept}
Unique Mechanism: ${productBrief.uniqueMechanism}
Pain Points: ${productBrief.painPoints?.join(", ")}
Chapters: ${chapterTitles}
Description: ${productContent?.description || ""}

Return ONLY valid JSON:
{
  "salesPage": "Full sales page copy with headline, subheadline, problem section, solution section, what's inside, benefits, testimonial placeholders, CTA sections, and guarantee. Use markdown formatting.",
  "optInPage": "Opt-in page copy with headline, 3 bullet benefits, and CTA. Include a free lead magnet angle.",
  "thankYouPage": "Thank you page copy confirming their purchase/opt-in with next steps and a surprise bonus mention.",
  "bonusPage": "Bonus page copy highlighting 3 exclusive bonuses they get with their purchase.",
  "checkoutCopy": "Checkout page copy with order summary, urgency element, and trust badges text."
}

Make each section comprehensive — at least 300 words for salesPage, 100+ for others.`;

    const { content, model } = await callTieredAI([{ role: "user", content: prompt }], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-funnel", result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
