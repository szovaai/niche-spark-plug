import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUMAN_TONE_DIRECTIVE = `
CRITICAL WRITING STYLE REQUIREMENT:
Write like a real human - warm, conversational, and relatable. NOT robotic or corporate.

DO:
- Use contractions naturally (you'll, it's, don't, we've)
- Vary sentence length - mix short punchy sentences with longer flowing ones
- Add personality touches ("Here's the thing...", "Pro tip:", "The secret?")
- Write in second person (you, your) to connect directly
- Sound confident but not salesy
- Use casual transitions ("So here's what you get...", "And the best part?")

DON'T:
- Use corporate buzzwords (leverage, utilize, synergy, optimize)
- Sound like a press release or Wikipedia
- Be overly formal or stiff
- Use passive voice excessively
- Add unnecessary filler words
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint, personalization } = await req.json();

    if (!blueprint) {
      return new Response(
        JSON.stringify({ error: "Missing blueprint data" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating bundle variants for:", blueprint.productName);

    const prompt = `You are an expert digital product strategist. Based on this product blueprint, create THREE product variants for a profitable bundle strategy.

ORIGINAL PRODUCT:
- Name: ${blueprint.productName}
- Type: ${blueprint.productType}
- Price Range: $${blueprint.priceRange.min} - $${blueprint.priceRange.max}
- Target Audience: ${personalization?.targetAudience || "General audience"}
- Transformation Focus: ${personalization?.transformationFocus || "General improvement"}
- Style: ${personalization?.styleVibe || "Modern"}
- Pages: ${blueprint.pages?.length || 10} pages
- Description: ${blueprint.aiSummary}

${HUMAN_TONE_DIRECTIVE}

Generate these THREE variants:

1. LITE VERSION (Tripwire Product)
- A smaller, lower-priced version that serves as an entry point
- Should be 30-40% of the original content
- Priced at $3-8 to attract first-time buyers
- Focus on one specific quick win

2. BONUS ADD-ON (Upsell Product)
- A complementary product that enhances the main product
- Could be: cheat sheet, tracker, quick reference card, checklist, or mini-guide
- Priced at $4-10
- Adds immediate extra value

3. PREMIUM BUNDLE (Complete Package)
- Combines main product + lite + bonus + exclusive extras
- Includes 1-2 additional exclusive items only in this bundle
- Priced at 1.5-2x the main product price
- Clear "best value" positioning

Return a JSON object with this exact structure:
{
  "liteVersion": {
    "name": "string",
    "description": "string (2-3 sentences)",
    "pageCount": number,
    "priceRange": { "min": number, "max": number },
    "keyFeatures": ["string", "string", "string"],
    "listingTitle": "string (Etsy-optimized)",
    "quickPitch": "string (one compelling sentence)"
  },
  "bonusAddOn": {
    "name": "string",
    "description": "string (2-3 sentences)",
    "format": "string (e.g., 'PDF Cheat Sheet', 'Printable Tracker')",
    "priceRange": { "min": number, "max": number },
    "keyFeatures": ["string", "string", "string"],
    "listingTitle": "string (Etsy-optimized)",
    "quickPitch": "string (one compelling sentence)"
  },
  "premiumBundle": {
    "name": "string",
    "description": "string (2-3 sentences)",
    "includedItems": ["Main product name", "Lite version name", "Bonus name", "Exclusive item 1", "Exclusive item 2"],
    "totalValue": number,
    "bundlePrice": { "min": number, "max": number },
    "savingsPercent": number,
    "listingTitle": "string (Etsy-optimized)",
    "quickPitch": "string (one compelling sentence)"
  },
  "bundleStrategy": {
    "upsellFlow": "string (explain how to present these products)",
    "crossPromotionIdeas": ["string", "string", "string"],
    "seasonalTip": "string (optional timing advice)"
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown or extra text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("LOVABLE_API_KEY") || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    const content = aiResponse.content[0]?.text;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let bundleVariants;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      bundleVariants = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("Bundle variants generated successfully");

    return new Response(
      JSON.stringify(bundleVariants),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-bundle-variants:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate bundle variants";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
