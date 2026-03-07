import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'brandName', type: 'string', required: true, maxLength: 200 },
      { field: 'niche', type: 'string', maxLength: 200 },
      { field: 'type', type: 'string', maxLength: 50, enum: ['logo', 'social'] },
      { field: 'symbolStyle', type: 'string', maxLength: 200 },
      { field: 'colorDirection', type: 'string', maxLength: 200 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { brandName, niche, type, symbolStyle, colorDirection } = data as Record<string, string>;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Server configuration error");

    let systemPrompt, userPrompt;

    if (type === "logo") {
      systemPrompt = `You are a logo prompt designer for AI image tools like Leonardo AI or Midjourney.
Create detailed, professional prompts that generate clean, modern logos.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Brand name: ${brandName}
First letter: ${(brandName as string).charAt(0).toUpperCase()}
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

    console.log("Generating social setup for user:", user.id);
    
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error("Unable to generate social content. Please try again.");
    }

    const data2 = await response.json();
    const content = data2.choices?.[0]?.message?.content;
    
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
      throw new Error("Failed to parse social content");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-generate-social:", error);
    return new Response(JSON.stringify({ error: "Unable to generate social content. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
