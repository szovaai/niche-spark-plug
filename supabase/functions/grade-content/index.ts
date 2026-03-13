import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || "Authentication required", corsHeaders);

    const { text, productTitle, targetAudience } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(user.id);

    const prompt = `You are an expert content quality analyst for digital products. Score this content on 6 axes (1-10 each) and provide specific improvement suggestions.

PRODUCT: ${productTitle || "Unknown"}
TARGET AUDIENCE: ${targetAudience || "Unknown"}

CONTENT TO GRADE:
${text.slice(0, 6000)}

Score each axis 1-10 and give ONE specific, actionable suggestion for improvement:

1. CLARITY - How easy is it to understand? Is the language simple and direct?
2. ACTIONABILITY - Does it tell the reader exactly what to do? Are there step-by-step instructions?
3. UNIQUENESS - Does it offer a fresh perspective or just rehash common advice?
4. ENGAGEMENT - Would a reader stay hooked? Is there storytelling, personality, momentum?
5. SALES_POWER - Does it build desire and overcome objections? Would it help sell the product?
6. READABILITY - Sentence length variety, paragraph breaks, formatting, flow?

Return ONLY valid JSON:
{
  "scores": {
    "clarity": { "score": 8, "suggestion": "..." },
    "actionability": { "score": 6, "suggestion": "..." },
    "uniqueness": { "score": 7, "suggestion": "..." },
    "engagement": { "score": 5, "suggestion": "..." },
    "salesPower": { "score": 7, "suggestion": "..." },
    "readability": { "score": 8, "suggestion": "..." }
  },
  "overall": 68,
  "topStrength": "...",
  "biggestGap": "...",
  "oneLineSummary": "..."
}`;

    const { content } = await callTieredAI([
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse grading response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Grade error:", error);
    const msg = error instanceof Error ? error.message : "Grading failed";
    const status = msg.includes("Rate limit") ? 429 : msg.includes("Payment") ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
