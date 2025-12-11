import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUMAN_TONE_DIRECTIVE = `
WRITING STYLE - "Human Tone Engine":
- Use contractions naturally (you'll, we're, isn't)
- Vary sentence length - mix short punchy sentences with longer flowing ones
- Add personality touches: "Here's the thing...", "Pro tip:", "Real talk:"
- Write in second person (you, your) for connection
- AVOID corporate buzzwords: leverage, utilize, synergy, optimize, scalable
- Sound confident but NOT salesy - like a smart friend giving advice
- Use specific examples and scenarios, not vague generalities
- Include occasional humor or relatable moments
- Write like you're texting a friend who asked for help
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint, personalization, nicheName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Generate a complete 7-day launch marketing kit for this digital product.

PRODUCT DETAILS:
- Product Name: ${blueprint.productName}
- Product Type: ${blueprint.productType || 'Digital Product'}
- Niche: ${nicheName}
- Target Audience: ${personalization.targetAudience}
- Transformation Focus: ${personalization.transformationFocus}
- Style Vibe: ${personalization.styleVibe}
- Price Tier: ${personalization.priceTier}
- Key Benefits: ${blueprint.marketingCopy?.benefitBullets?.slice(0, 3).join(', ') || 'Not specified'}

Generate the following content in JSON format:

1. "tiktokScripts" - Array of 5 TikTok/Reels scripts, each with:
   - hook (attention-grabbing first 3 seconds)
   - body (main content, 30-45 seconds)
   - callToAction (specific CTA)
   - soundSuggestion (trending sound or audio type)
   - textOverlays (array of 3-5 text overlay suggestions)

2. "instagramCarousels" - Array of 3 Instagram carousel outlines, each with:
   - title (carousel topic)
   - slides (array of 5-7 slides, each with slideNumber, headline, body, visualSuggestion)
   - caption (engaging caption with call to action)
   - hashtags (array of 10-15 relevant hashtags)

3. "pinterestPins" - Array of 10 Pinterest pin descriptions, each with:
   - title (SEO-optimized title, max 100 chars)
   - description (keyword-rich description, 150-300 chars)
   - keywords (array of 5-7 keywords)
   - boardSuggestion (suggested board name)

4. "emailTemplates" - Array of 3 emails:
   - type: "launch" (announcement), "reminder" (48hr reminder), "lastChance" (final hours)
   - subjectLine (compelling subject)
   - previewText (preview text, 40-50 chars)
   - body (full email body with formatting)
   - callToAction (button text)

5. "powerHooks" - Array of 15 power hooks with:
   - platform ("tiktok", "instagram", "pinterest", "email", or "universal")
   - hook (the attention-grabbing line)
   - angle (what angle/emotion it targets)

6. "launchCalendar" - Array of 7 days with:
   - day (1-7)
   - date (relative like "Launch Day", "Day 2", etc.)
   - platform (where to post)
   - contentType (what type of content)
   - description (what to post/do)
   - bestTime (best posting time)

IMPORTANT:
- Make ALL content specific to ${personalization.targetAudience}
- Use language that resonates with the ${personalization.styleVibe} aesthetic
- Focus on the ${personalization.transformationFocus} transformation
- Include real, actionable content - not placeholders
- Vary the hooks and angles to reach different pain points

Return ONLY valid JSON with these 6 keys.`;

    console.log("Generating launch kit for:", blueprint.productName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: HUMAN_TONE_DIRECTIVE + "\nYou are an expert digital product marketer who creates viral, engaging content. You understand social media algorithms and what makes content perform. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please upgrade your plan." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate launch kit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response
    let launchKit;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      launchKit = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse launch kit JSON:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Launch kit generated successfully");

    return new Response(
      JSON.stringify(launchKit),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-launch-kit:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
