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

    const { nicheName, nicheCategory, demandTier, competitionTier } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert digital product strategist specializing in PLR (Private Label Rights) content and digital product creation for platforms like Etsy, Gumroad, and Shopify.

Given a niche, provide actionable product pack recommendations. Be specific, creative, and practical.

Always respond with valid JSON in this exact format:
{
  "productType": "Specific product format (e.g., '24-page printable planner + bonus checklist')",
  "priceRange": { "min": number, "max": number },
  "titleIdeas": ["Title 1", "Title 2", "Title 3"],
  "productOutline": ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"],
  "differentiatorTips": ["Tip 1 to stand out", "Tip 2 to stand out", "Tip 3 to stand out"],
  "bestPlatform": "Where to sell this (Etsy/Gumroad/Shopify)",
  "aiSummary": "A brief 2-3 sentence strategy overview"
}`;

    const userPrompt = `Create a "Product Pack" recommendation for this niche:
- Niche: ${nicheName}
- Category: ${nicheCategory}
- Demand Level: ${demandTier}
- Competition: ${competitionTier}

Provide specific, actionable recommendations that someone could implement today.`;

    console.log("Generating build pack for:", nicheName);

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API usage limit reached. Please check your DeepSeek account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      throw new Error("DeepSeek API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON from the AI response
    let packData;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      packData = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    console.log("Build pack generated successfully");

    return new Response(JSON.stringify(packData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("build-pack error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate build pack. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
