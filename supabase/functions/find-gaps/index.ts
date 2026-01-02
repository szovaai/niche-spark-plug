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
    const { nicheName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this niche for digital products and find opportunity gaps: "${nicheName}"\n\nThink about what products exist, what's missing, who's being ignored, and where the quick wins are. Return only valid JSON.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse JSON from response - handle markdown code blocks
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse JSON from response:", content);
      throw new Error("Could not parse JSON from response");
    }

    const gapAnalysis = JSON.parse(jsonMatch[0]);
    console.log("Gap analysis complete for:", nicheName);

    return new Response(JSON.stringify(gapAnalysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Gap finder error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Failed to analyze gaps" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
