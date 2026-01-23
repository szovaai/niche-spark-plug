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
    const { brandName, niche, type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt, userPrompt;

    if (type === "logo") {
      const { symbolStyle, colorDirection } = await req.json();
      systemPrompt = `You are a logo prompt designer for AI image tools like Leonardo AI or Midjourney.
Create detailed, professional prompts that generate clean, modern logos.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Brand name: ${brandName}
First letter: ${brandName.charAt(0).toUpperCase()}
Symbol style: ${symbolStyle || "minimal"}
Color direction: ${colorDirection || "neutral"}

Create two separate prompts:
1. A minimal monogram logo using just the first letter, suitable for profile pictures
2. A logo that includes a simple symbol plus the brand name in modern typography

Output as JSON:
{
  "monogram_prompt": "Detailed prompt for the monogram...",
  "symbol_prompt": "Detailed prompt for the symbol logo..."
}`;
    } else {
      systemPrompt = `You are a social media brand strategist specializing in building faceless brands.
Create bios and warming plans that feel authentic and non-salesy.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Brand name: ${brandName}
Niche: ${niche}
Platforms: Instagram, TikTok

Write a short Instagram bio and TikTok bio that:
- Are clear and non-hypey
- Explain what the account helps with
- Include a light CTA (like "Get the system ↓")

Create a simple 3-day account warming plan for a brand-new account in this niche.
For each day, specify:
- How long to scroll content
- How many posts to like
- How many comments to leave
- How many accounts to follow

Output as JSON:
{
  "instagram_bio": "...",
  "tiktok_bio": "...",
  "warming_plan": [
    { "day": 1, "scroll_time": "15-20 min", "likes": 30, "comments": 5, "follows": 10 },
    { "day": 2, "scroll_time": "15-20 min", "likes": 30, "comments": 8, "follows": 10 },
    { "day": 3, "scroll_time": "15-20 min", "likes": 25, "comments": 10, "follows": 10 }
  ]
}`;
    }

    console.log("Calling Lovable AI for social setup...");
    
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-generate-social:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
