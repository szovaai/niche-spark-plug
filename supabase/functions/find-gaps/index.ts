import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { getUserTier, callTieredAI } from "../_shared/tieredAI.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { nicheName } = await req.json();

    if (!nicheName || nicheName.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Niche name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user tier for model selection
    const userTier = await getUserTier(user.id);
    console.log(`User tier: ${userTier}`);

    // Generate cache key
    const cacheKey = generateCacheKey('find-gaps', { nicheName: nicheName.toLowerCase().trim() });

    // Check cache first
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      console.log(`Returning cached gap analysis (model: ${cached.model_used})`);
      return new Response(JSON.stringify(cached.response), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    console.log(`Finding gaps for niche: ${nicheName}`);

    const systemPrompt = `You are a market research expert specializing in digital products on Etsy, Gumroad, and Shopify. Your job is to analyze a niche and find untapped opportunities.

HUMAN TONE: Write naturally, use contractions, vary sentence length, avoid corporate buzzwords.

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "nicheName": "string",
  "marketOverview": {
    "totalListings": "string estimate like '5,000+'",
    "averagePrice": "string like '$8-15'",
    "dominantProductTypes": ["array", "of", "types"],
    "marketMaturity": "Emerging|Growing|Mature|Saturated"
  },
  "opportunityGaps": [
    {
      "id": "unique_id",
      "title": "Gap title",
      "description": "What's missing in the market",
      "demandSignal": "Strong|Moderate|Emerging",
      "difficultyToFill": "Easy|Medium|Hard",
      "suggestedProductType": "Product type to create",
      "potentialRevenue": "$X-Y",
      "whyItWorks": "Brief explanation"
    }
  ],
  "underservedAudiences": [
    {
      "audience": "Specific audience",
      "painPoints": ["pain1", "pain2"],
      "currentGap": "What they can't find",
      "productSuggestion": "What to create for them",
      "messagingAngle": "Marketing hook to use"
    }
  ],
  "missingProductTypes": [
    {
      "productType": "Type name",
      "reason": "Why it's missing",
      "demandEvidence": "How we know there's demand",
      "implementationIdea": "How to create it"
    }
  ],
  "pricingGaps": [
    {
      "priceRange": "$X-Y",
      "observation": "What's happening at this price",
      "opportunity": "What you could do"
    }
  ],
  "quickWinOpportunities": [
    {
      "title": "Opportunity name",
      "effort": "Low|Medium|High",
      "potentialReward": "Low|Medium|High",
      "timeToMarket": "X hours/days",
      "description": "Brief description"
    }
  ],
  "competitorWeaknesses": [
    {
      "weakness": "What competitors do poorly",
      "howToExploit": "How to do it better",
      "exampleApproach": "Specific example"
    }
  ]
}

Provide 3-5 items for each array. Be specific and actionable.`;

    // Use tiered AI - standard task for gap analysis
    const { content, model } = await callTieredAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this niche for digital products and find opportunity gaps: "${nicheName}"\n\nThink about what products exist, what's missing, who's being ignored, and where the quick wins are. Return only valid JSON.` }
      ],
      userTier,
      'standard'
    );

    // Parse JSON from response - handle markdown code blocks
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse JSON from response:", content);
      throw new Error("Could not parse JSON from response");
    }

    const gapAnalysis = JSON.parse(jsonMatch[0]);
    console.log("Gap analysis complete for:", nicheName);

    // Cache the response for 24 hours
    await setCachedResponse(
      cacheKey,
      'find-gaps',
      nicheName,
      gapAnalysis,
      userTier,
      model,
      24
    );

    return new Response(JSON.stringify(gapAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });

  } catch (error) {
    console.error("Gap finder error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Failed to analyze gaps" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
