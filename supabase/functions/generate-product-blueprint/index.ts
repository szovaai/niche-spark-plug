import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Human Tone Engine Template - The secret sauce for natural writing
const HUMAN_TONE_DIRECTIVE = `
WRITING STYLE DIRECTIVE (Human Tone Engine™):

You write like a friendly expert helping a creator friend. Your writing feels natural, conversational, and actionable.

Voice Characteristics:
✓ Use contractions naturally (you'll, don't, it's, here's, won't, can't)
✓ Start occasional sentences with "And" or "But" for flow
✓ Mix short punchy sentences with longer explanations
✓ Add personality touches: "Here's the thing...", "Pro tip:", "Quick win:", "The secret?"
✓ Write in second person ("you" not "the user")
✓ Sound confident but not salesy or pushy
✓ Be specific and actionable, not vague
✓ Include relatable moments that show you understand the buyer

NEVER use these words/phrases:
- leverage, utilize, synergy, cutting-edge, next-level
- empower, streamline, optimize, revolutionize
- "designed to", "aimed at", "geared towards"
- Corporate buzzwords or marketing fluff

Example GOOD writing:
"This planner is perfect for busy moms who've tried everything but can't seem to stick to a routine. Here's the thing — you don't need more willpower. You need a system that actually fits your chaotic life. And that's exactly what this does."

Example BAD writing:
"This leveraging solution utilizes cutting-edge methodology to empower users in their productivity journey through synergistic planning frameworks."
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nicheName, nicheCategory, demandTier, competitionTier, productType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${productType} blueprint for niche: ${nicheName}`);

    // Product-specific configurations
    const productConfigs: Record<string, { pageCount: string; sections: string }> = {
      "Planner": { 
        pageCount: "20-30 pages", 
        sections: "cover page, intro/welcome, monthly overview, weekly spreads (12), goal setting, habit tracker, reflection pages, notes" 
      },
      "Printable Pack": { 
        pageCount: "8-15 pages", 
        sections: "cover sheet, main printables (trackers, checklists, worksheets), bonus pages, instructions page" 
      },
      "Canva Template": { 
        pageCount: "15-25 templates", 
        sections: "main templates, variations, bonus templates, style guide" 
      },
      "Notion Template": { 
        pageCount: "3-5 main pages", 
        sections: "dashboard, databases, views, automations, quick start guide" 
      },
      "Spreadsheet": { 
        pageCount: "3-7 sheets", 
        sections: "dashboard, data input, calculations, summary, instructions" 
      },
      "Guide": { 
        pageCount: "20-40 pages", 
        sections: "cover, intro, chapters (5-8), action steps, resources, conclusion" 
      },
      "Wall Art": { 
        pageCount: "8-15 designs", 
        sections: "main quotes, motivational art, decorative pieces, size variations" 
      },
      "Social Media Kit": { 
        pageCount: "25-50 templates", 
        sections: "Instagram posts, stories, reels covers, Pinterest pins, highlight covers" 
      },
      "Digital Stickers": { 
        pageCount: "80-150 stickers", 
        sections: "functional stickers, decorative, washi tape, icons, text stickers" 
      },
    };

    const config = productConfigs[productType] || productConfigs["Planner"];

    const systemPrompt = `You are an expert digital product creator and copywriter specializing in creating bestselling products for Etsy, Gumroad, and Creative Market.

${HUMAN_TONE_DIRECTIVE}

You're creating a complete product blueprint that a creator can use to build and launch a digital product TODAY.

IMPORTANT: Generate SPECIFIC, ACTIONABLE content. No placeholder text. Every suggestion should be something they can copy and use immediately.

Respond with valid JSON in this exact format:
{
  "productName": "Catchy, SEO-friendly product name",
  "productType": "${productType}",
  "priceRange": { "min": number, "max": number },
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page title",
      "description": "What this page does",
      "contentSuggestion": "Actual text/copy to use on this page",
      "layoutNotes": "Design and layout recommendations"
    }
  ],
  "styleGuide": {
    "primaryColor": "#hexcode",
    "secondaryColor": "#hexcode",
    "accentColor": "#hexcode",
    "fontPrimary": "Font name for headings",
    "fontSecondary": "Font name for body",
    "aesthetic": "Overall visual style description",
    "moodKeywords": ["keyword1", "keyword2", "keyword3"]
  },
  "marketingCopy": {
    "shortDescription": "1-2 sentence hook for social media",
    "fullDescription": "3-4 paragraph listing description with natural flow, written in Human Tone",
    "bulletPoints": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
    "seoTags": ["tag1", "tag2", ... ] (exactly 13 tags for Etsy)
  },
  "titleIdeas": ["Title option 1", "Title option 2", "Title option 3"],
  "uniqueAngles": ["Differentiator 1", "Differentiator 2", "Differentiator 3"],
  "buyerPersona": "Detailed description of the ideal buyer",
  "aiSummary": "2-3 sentence strategy overview in Human Tone"
}`;

    const userPrompt = `Create a complete product blueprint for:

NICHE: ${nicheName}
CATEGORY: ${nicheCategory}
DEMAND LEVEL: ${demandTier}
COMPETITION: ${competitionTier}
PRODUCT TYPE: ${productType}

Expected format: ${config.pageCount}
Key sections to include: ${config.sections}

Requirements:
1. Generate ${config.pageCount.split("-")[0]}-${config.pageCount.split("-")[1] || "10"} specific pages with actual content suggestions
2. Include color palette that matches the ${nicheCategory} aesthetic
3. Write marketing copy in the Human Tone (friendly, conversational, no buzzwords)
4. Create 13 SEO tags optimized for Etsy search
5. Make all content specific to this niche - no generic filler
6. Price appropriately for the demand (${demandTier}) and competition (${competitionTier}) levels`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please upgrade your plan." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON from the AI response
    let blueprintData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      blueprintData = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    console.log(`Successfully generated blueprint for ${productType}: ${blueprintData.productName}`);

    return new Response(JSON.stringify(blueprintData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-product-blueprint error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
