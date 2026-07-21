import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUMAN_TONE_DIRECTIVE = `
Write in a warm, conversational tone that sounds like a real person (not robotic).
- Use contractions naturally (you'll, it's, don't)
- Vary sentence length for rhythm
- Add personality touches ("Here's the thing...", "Pro tip:")
- Write in second person (you, your)
- Avoid corporate buzzwords (leverage, utilize, synergy)
- Sound confident but not salesy
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return new Response(JSON.stringify({ error: authError || "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { blueprint, personalization, platform, nicheName } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const systemPrompt = `You are an expert Etsy and digital product listing optimizer.
${HUMAN_TONE_DIRECTIVE}

Generate a complete listing kit that will SELL. Focus on SEO, emotional triggers, and clear value.

Return a JSON object with this exact structure:
{
  "titles": {
    "primary": "SEO-optimized main title (max 140 chars for Etsy)",
    "alternative1": "Alternative title option",
    "alternative2": "Third title variation"
  },
  "etsyTags": ["tag1", "tag2", ... 13 tags total, each max 20 chars],
  "descriptions": {
    "short": "100-word punchy description",
    "long": "300-word detailed description with formatting",
    "gumroad": "Gumroad-optimized description",
    "shopify": "Shopify product description"
  },
  "pricingStrategy": {
    "suggestedPrice": 12.99,
    "launchPrice": 9.99,
    "bundlePrice": 24.99,
    "psychology": "Why this pricing works"
  },
  "policies": {
    "refundPolicy": "Professional refund policy text",
    "licensingText": "Clear usage rights",
    "faq": [
      {"question": "Common Q1", "answer": "Answer"},
      {"question": "Common Q2", "answer": "Answer"},
      {"question": "Common Q3", "answer": "Answer"}
    ]
  },
  "seoKeywords": ["keyword1", "keyword2", ... 10 keywords]
}`;

    const userPrompt = `Create a listing kit for this digital product:

PRODUCT: ${blueprint?.productName || 'Digital Product'}
NICHE: ${nicheName}
TYPE: ${blueprint?.productType || personalization?.productType}
TARGET AUDIENCE: ${personalization?.targetAudience}
TRANSFORMATION: ${personalization?.transformationFocus}
STYLE: ${personalization?.styleVibe}
PRICE TIER: ${personalization?.priceTier}
PLATFORM: ${platform}

PRODUCT DESCRIPTION:
${blueprint?.description || 'A high-quality digital product'}

KEY FEATURES:
${blueprint?.marketingCopy?.benefitBullets?.join('\n') || 'Quality digital product'}

Generate titles that:
- Include main keywords naturally
- Highlight the transformation/benefit
- Appeal to ${personalization?.targetAudience}

Generate 13 Etsy tags that:
- Include long-tail keywords
- Cover synonyms and related terms
- Target the specific audience

Write descriptions that:
- Lead with the biggest benefit
- Use bullet points for features
- Include a clear call-to-action
- Address the target audience directly`;

    console.log("Generating listing kit for:", blueprint?.productName);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse listing kit from AI response");
    }

    const listingKit = JSON.parse(jsonMatch[0]);
    console.log("Listing kit generated successfully");

    return new Response(JSON.stringify(listingKit), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating listing kit:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
