import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Upgrading PLR: ${input.plrTitle}`);

    const systemPrompt = `You are a digital product transformation expert. You take generic PLR content and transform it into unique, high-quality products.

HUMAN TONE ENGINE: Write like a real person. Use contractions naturally. Vary sentence length. Add personality ("Here's the thing...", "Pro tip:"). Avoid corporate buzzwords (leverage, utilize, synergy). Sound confident but not salesy.

UPGRADE LEVELS:
- basic: New title, description, style suggestions
- complete: Full rewrite + ecover concepts + marketing copy
- premium: Everything + upsells + bundle strategy

Return a JSON object with this EXACT structure:
{
  "upgradedTitle": "New compelling title",
  "rewrittenDescription": "Completely rewritten description (2-3 paragraphs)",
  "contentTransformations": [
    {
      "section": "Section name",
      "originalApproach": "What the PLR does",
      "upgradedApproach": "What to do instead",
      "keyChanges": ["change1", "change2"]
    }
  ],
  "styleOverhaul": {
    "primaryColor": "#hexcode",
    "secondaryColor": "#hexcode",
    "accentColor": "#hexcode",
    "fontPairing": "Font1 + Font2",
    "aesthetic": "Aesthetic name",
    "moodKeywords": ["word1", "word2", "word3"]
  },
  "ecoverConcepts": [
    {
      "style": "Style name",
      "description": "Visual description",
      "keyElements": ["element1", "element2"],
      "colorScheme": "Color description"
    }
  ],
  "upsellIdeas": [
    {
      "productName": "Upsell name",
      "productType": "Type",
      "description": "What it is",
      "priceRange": { "min": 5, "max": 15 },
      "whyItWorks": "Why customers want this"
    }
  ],
  "bundleStrategy": {
    "bundleName": "Bundle name",
    "includedProducts": ["product1", "product2"],
    "bundlePrice": { "min": 20, "max": 35 },
    "savingsMessage": "Save X%",
    "marketingAngle": "Why buy the bundle"
  },
  "differentiationReport": {
    "uniquenessScore": 85,
    "keyDifferentiators": ["diff1", "diff2"],
    "competitiveAdvantages": ["advantage1", "advantage2"],
    "marketPositioning": "How this stands out"
  },
  "marketingCopy": {
    "headline": "Main headline",
    "subheadline": "Supporting headline",
    "bullets": ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5"],
    "cta": "Call to action"
  }
}

Make all content unique and valuable. The goal is to transform generic PLR into a product that feels custom-made.`;

    const userPrompt = `Transform this PLR content for ${input.targetAudience} audience with ${input.styleVibe} style.

ORIGINAL PLR:
Title: ${input.plrTitle}
Description: ${input.plrDescription}
Content Sample: ${input.plrContentSample || 'Not provided'}
Niche: ${input.originalNiche}

Upgrade Level: ${input.upgradeLevel}

Create a complete transformation package that makes this product unique and valuable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from response");
    }

    const upgrade = JSON.parse(jsonMatch[0]);
    console.log("PLR upgrade complete:", input.plrTitle);

    return new Response(JSON.stringify(upgrade), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("PLR upgrade error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Failed to upgrade PLR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
