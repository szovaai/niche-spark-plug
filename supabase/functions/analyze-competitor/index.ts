import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

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

    const { url } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    console.log("Analyzing competitor URL:", url);

    const prompt = `You are an expert digital product analyst and competitor researcher.

Analyze this Etsy listing URL: ${url}

Based on typical Etsy digital product listings in this niche, provide a comprehensive competitor analysis. Create realistic data based on the URL structure and common patterns for similar products.

Provide analysis with:

1. Original Product Analysis:
   - Estimated title (based on URL/typical patterns)
   - Estimated price point
   - Common tags for this niche
   - Typical description elements
   - Likely strengths (what probably works)
   - Probable weaknesses (common gaps)
   - Estimated monthly sales range

2. Differentiation Strategy:
   - A unique angle to stand out
   - Target audience twist (underserved segment)
   - Pricing strategy recommendation
   - 3-5 improvement opportunities
   - Main gap to exploit

3. Your Improved Version:
   - Better, SEO-optimized title
   - Improved description (150-200 words)
   - Suggested price range
   - 5 key differentiators
   - 13 optimized Etsy tags
   - Recommended product type
   - Target audience
   - Style vibe
   - Transformation focus

4. Competitive Advantages (5 points you'd have over them)

5. Action Plan (5 quick steps to launch the improved version)

Return as JSON:
{
  "originalProduct": {
    "title": "",
    "price": 0,
    "tags": [],
    "description": "",
    "reviewInsights": [{"sentiment": "positive|negative|neutral", "theme": "", "quote": ""}],
    "strengths": [],
    "weaknesses": [],
    "estimatedMonthlySales": ""
  },
  "differentiationStrategy": {
    "uniqueAngle": "",
    "targetAudienceTwist": "",
    "pricingStrategy": "",
    "improvementOpportunities": [],
    "gapToExploit": ""
  },
  "suggestedProduct": {
    "newTitle": "",
    "newDescription": "",
    "suggestedPrice": {"min": 0, "max": 0},
    "keyDifferentiators": [],
    "betterTags": [],
    "productType": "",
    "targetAudience": "",
    "styleVibe": "",
    "transformationFocus": ""
  },
  "competitiveAdvantages": [],
  "actionPlan": []
}`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are an expert Etsy product analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("Competitor analysis completed");

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-competitor:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
