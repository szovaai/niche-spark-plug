import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { getUserTier, callTieredAI } from "../_shared/tieredAI.ts";

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

// Personalization weighting directive
const PERSONALIZATION_DIRECTIVE = `
PERSONALIZATION WEIGHTING (Critical for Uniqueness):

The user has selected specific personalization options. These MUST heavily influence every aspect of the product:

1. TARGET AUDIENCE: This person's specific pain points, language, daily routines, and aspirations should be woven throughout. Use examples and scenarios specific to their life.

2. TRANSFORMATION FOCUS: This is the emotional hook. The product should clearly promise and deliver this specific transformation. It should be mentioned in titles, descriptions, and page content.

3. STYLE VIBE: The aesthetic should match perfectly. Colors, font recommendations, layout suggestions, and mood should all align with this vibe.

4. PRICE TIER: Content depth, perceived value, and features should match the price point. Higher tiers get more pages, more detail, more premium feel.

DO NOT create generic content. Every page, every description, every suggestion must feel specifically crafted for THIS audience pursuing THIS transformation with THIS aesthetic at THIS price point.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }
    console.log(`Authenticated user: ${user.id}`);

    const { nicheName, nicheCategory, demandTier, competitionTier, productType, personalization, plrContent } = await req.json();

    // Get user tier for model selection
    const userTier = await getUserTier(user.id);
    console.log(`User tier: ${userTier}`);

    // Generate cache key based on input
    const cacheInput = { nicheName, nicheCategory, productType, personalization, plrContent: plrContent?.kitTitle };
    const cacheKey = generateCacheKey('generate-product-blueprint', cacheInput);

    // Check cache first (only for non-PLR content since PLR transformations should be unique)
    if (!plrContent) {
      const cached = await getCachedResponse(cacheKey);
      if (cached) {
        console.log(`Returning cached blueprint (model: ${cached.model_used})`);
        return new Response(JSON.stringify(cached.response), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
        });
      }
    }

    console.log(`Generating personalized ${productType} blueprint for niche: ${nicheName}`);
    console.log(`Personalization:`, JSON.stringify(personalization));
    if (plrContent) {
      console.log(`PLR Mode enabled - transforming: ${plrContent.kitTitle}`);
    }

    // Product-specific configurations with price tier adjustments
    const getPageCount = (baseMin: number, baseMax: number, priceTier: string): string => {
      const multiplier = priceTier?.includes("Budget") ? 0.7 : 
                        priceTier?.includes("Value") ? 1 : 
                        priceTier?.includes("Premium") ? 1.3 : 
                        priceTier?.includes("Luxury") ? 1.6 : 1;
      return `${Math.round(baseMin * multiplier)}-${Math.round(baseMax * multiplier)} pages`;
    };

    const productConfigs: Record<string, { basePageCount: [number, number]; sections: string }> = {
      "Planner": { 
        basePageCount: [20, 30], 
        sections: "cover page, intro/welcome, monthly overview, weekly spreads (12), goal setting, habit tracker, reflection pages, notes" 
      },
      "Printable Pack": { 
        basePageCount: [8, 15], 
        sections: "cover sheet, main printables (trackers, checklists, worksheets), bonus pages, instructions page" 
      },
      "Canva Template": { 
        basePageCount: [15, 25], 
        sections: "main templates, variations, bonus templates, style guide" 
      },
      "Notion Template": { 
        basePageCount: [3, 5], 
        sections: "dashboard, databases, views, automations, quick start guide" 
      },
      "Spreadsheet": { 
        basePageCount: [3, 7], 
        sections: "dashboard, data input, calculations, summary, instructions" 
      },
      "Guide": { 
        basePageCount: [20, 40], 
        sections: "cover, intro, chapters (5-8), action steps, resources, conclusion" 
      },
      "Wall Art": { 
        basePageCount: [8, 15], 
        sections: "main quotes, motivational art, decorative pieces, size variations" 
      },
      "Social Media Kit": { 
        basePageCount: [25, 50], 
        sections: "Instagram posts, stories, reels covers, Pinterest pins, highlight covers" 
      },
      "Digital Stickers": { 
        basePageCount: [80, 150], 
        sections: "functional stickers, decorative, washi tape, icons, text stickers" 
      },
    };

    const config = productConfigs[productType] || productConfigs["Planner"];
    const pageCount = getPageCount(config.basePageCount[0], config.basePageCount[1], personalization?.priceTier);

    // Build personalization context for the prompt
    const personalizationContext = personalization ? `
PERSONALIZATION REQUIREMENTS (MUST follow these exactly):
- TARGET AUDIENCE: ${personalization.targetAudience}
  → Write all content specifically for this person. Use their language, reference their daily struggles, celebrate their wins.
  
- TRANSFORMATION FOCUS: ${personalization.transformationFocus}
  → This is the core promise. The product title, hook, and content should all lead to this transformation.
  
- STYLE VIBE: ${personalization.styleVibe}
  → Match colors, fonts, and overall aesthetic to this vibe. Be specific in style guide.
  
- PRICE TIER: ${personalization.priceTier}
  → Adjust content depth and perceived value to match this tier. ${
    personalization.priceTier?.includes("Budget") ? "Keep it simple, focused, high-value basics." :
    personalization.priceTier?.includes("Value") ? "Solid value with good depth and nice extras." :
    personalization.priceTier?.includes("Premium") ? "Premium feel with comprehensive content and bonuses." :
    "Luxury experience with maximum depth, exclusive feel, and exceptional quality."
  }
` : "";

    // PLR transformation directive
    const PLR_DIRECTIVE = plrContent ? `
IMPORTANT - PLR TRANSFORMATION MODE:
You are transforming existing PLR content into a UNIQUE product. The original PLR is:
- Title: ${plrContent.kitTitle}
- Description: ${plrContent.description}
${plrContent.contentSample ? `- Sample content: ${plrContent.contentSample.substring(0, 500)}...` : ''}
- Intended use: ${plrContent.funnelRole || 'front_end'}

YOUR TASK:
1. REIMAGINE the structure - don't just copy the PLR layout
2. REWRITE all content in your own voice, matching the personalization choices
3. ADD unique angles and fresh perspectives not in the original
4. DIFFERENTIATE through the specific audience and transformation focus
5. Make it feel PREMIUM and ORIGINAL, not like recycled PLR
6. The result should pass a plagiarism check - create truly unique content
` : "";

    const systemPrompt = `You are an expert digital product creator and copywriter specializing in creating bestselling products for Etsy, Gumroad, and Creative Market.

${HUMAN_TONE_DIRECTIVE}

${PERSONALIZATION_DIRECTIVE}

${PLR_DIRECTIVE}

You're creating a complete product blueprint that a creator can use to build and launch a digital product TODAY.

IMPORTANT: Generate SPECIFIC, ACTIONABLE content. No placeholder text. Every suggestion should be something they can copy and use immediately.

The content MUST feel uniquely crafted for the specific audience and transformation - not generic.

Respond with valid JSON in this exact format:
{
  "productName": "Catchy, SEO-friendly product name that includes the audience/transformation angle",
  "productType": "${productType}",
  "priceRange": { "min": number, "max": number },
  "pages": [
    {
      "pageNumber": 1,
      "title": "Page title",
      "description": "What this page does",
      "contentSuggestion": "Actual text/copy to use on this page - personalized for the target audience",
      "layoutNotes": "Design and layout recommendations matching the style vibe"
    }
  ],
  "styleGuide": {
    "primaryColor": "#hexcode matching the style vibe",
    "secondaryColor": "#hexcode",
    "accentColor": "#hexcode",
    "fontPrimary": "Font name for headings that matches the vibe",
    "fontSecondary": "Font name for body",
    "aesthetic": "Overall visual style description matching the selected vibe",
    "moodKeywords": ["keyword1", "keyword2", "keyword3"]
  },
  "marketingCopy": {
    "shortDescription": "1-2 sentence hook mentioning the audience and transformation",
    "fullDescription": "3-4 paragraph listing description with natural flow, written for the specific audience pursuing this transformation",
    "bulletPoints": ["Benefit 1 for this audience", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
    "seoTags": ["tag1", "tag2", ... ] (exactly 13 tags for Etsy, include audience-specific terms)
  },
  "titleIdeas": ["Title option 1 with audience angle", "Title option 2 with transformation", "Title option 3"],
  "uniqueAngles": ["What makes this different for this audience", "Differentiator 2", "Differentiator 3"],
  "buyerPersona": "Detailed description of the ideal buyer from the selected audience",
  "aiSummary": "2-3 sentence strategy overview highlighting why this works for this specific audience"
}`;

    const userPrompt = `Create a complete, PERSONALIZED product blueprint for:

NICHE: ${nicheName}
CATEGORY: ${nicheCategory}
DEMAND LEVEL: ${demandTier}
COMPETITION: ${competitionTier}
PRODUCT TYPE: ${productType}

${personalizationContext}

Expected format: ${pageCount}
Key sections to include: ${config.sections}

Requirements:
1. Generate ${pageCount.split("-")[0]}-${pageCount.split("-")[1] || "10"} specific pages with content personalized for ${personalization?.targetAudience || "the target audience"}
2. Include color palette that matches the ${personalization?.styleVibe || nicheCategory} aesthetic exactly
3. Write marketing copy in Human Tone specifically addressing ${personalization?.targetAudience || "the audience"}'s pain points
4. Focus the entire product on achieving ${personalization?.transformationFocus || "the transformation"}
5. Create 13 SEO tags optimized for Etsy search, including audience-specific terms
6. Make EVERY piece of content specific to this niche + audience combo - NO generic filler
7. Price within the ${personalization?.priceTier || "Value ($8-15)"} range`;

    // Use tiered AI - complex task for blueprints
    const { content, model } = await callTieredAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      userTier,
      'complex' // Blueprints are complex tasks
    );

    // Parse the JSON from the AI response
    let blueprintData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      blueprintData = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Add personalization data to the response for reference
    blueprintData.personalization = personalization;

    console.log(`Successfully generated personalized blueprint for ${productType}: ${blueprintData.productName}`);

    // Cache the response (skip for PLR content)
    if (!plrContent) {
      await setCachedResponse(
        cacheKey,
        'generate-product-blueprint',
        JSON.stringify(cacheInput),
        blueprintData,
        userTier,
        model,
        24 // Cache for 24 hours
      );
    }

    return new Response(JSON.stringify(blueprintData), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("generate-product-blueprint error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
