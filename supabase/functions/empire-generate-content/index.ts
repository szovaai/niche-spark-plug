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
      { field: 'niche', type: 'string', maxLength: 200 },
      { field: 'productName', type: 'string', maxLength: 200 },
      { field: 'topic', type: 'string', maxLength: 500 },
      { field: 'type', type: 'string', required: true, maxLength: 50, enum: ['ideas', 'script', 'ads', 'schedule'] },
      { field: 'topics', type: 'array', maxItems: 20 },
      { field: 'daysPerWeek', type: 'number', min: 1, max: 7 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, productName, topic, type, topics, daysPerWeek } = data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Server configuration error");

    let systemPrompt, userPrompt;

    if (type === "ideas") {
      systemPrompt = `You are a viral short-form content strategist specializing in TikTok, Reels, and YouTube Shorts.
Create scroll-stopping, emotion-driven content ideas.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Generate 10 viral short-form video topic ideas for the ${niche} niche.

Each topic must be:
- Scroll-stopping (makes people pause their scroll)
- Emotion-driven (triggers curiosity, FOMO, motivation, or urgency)
- Easy to replicate with simple visuals (B-roll, text-on-screen, or AI images)

Output as JSON array:
[
  { 
    "topic": "Topic title", 
    "explanation": "Why this would perform well",
    "type": "viral" or "value" or "both"
  }
]`;
    } else if (type === "script") {
      systemPrompt = `You are a top viral short-form video creator.
Create high-retention scripts with cinematic visuals.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Create a 30-45 second viral short-form script for this topic: ${topic}

Style:
- Dark, cinematic
- Short sentences
- High retention

Also generate cinematic image prompts for each scene.
Image style: dark, minimal, high-contrast, 9:16, viral short-form aesthetic.

Include:
- Hook line (first 2 seconds)
- Scene-by-scene script
- Suggested on-screen text
- A CTA that naturally mentions the product: ${productName} (a digital system in the ${niche} niche)

Output as JSON:
{
  "hook": "First line that stops the scroll...",
  "scenes": [
    { 
      "scene_number": 1, 
      "narration": "What to say...", 
      "on_screen_text": "Text overlay...", 
      "image_prompt": "AI image prompt for this scene..." 
    }
  ],
  "cta": "Final call to action..."
}`;
    } else if (type === "ads") {
      systemPrompt = `You are a performance marketer for short-form ads on TikTok and Instagram.
Create ad angles that convert viewers into buyers.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Here are some content topics: ${JSON.stringify(topics)}

Pick 10-15 that would work best as ads for the product: ${productName}

For each, write:
- A short ad angle name
- The core hook (first line)
- The main benefit being promised
- A strong CTA

Output as JSON array:
[
  {
    "angle_name": "The Transformation Angle",
    "hook": "I went from chaos to control in 1 week...",
    "benefit": "Complete life organization system",
    "cta": "Link in bio to get yours"
  }
]`;
    } else {
      const days = (daysPerWeek as number) || 5;
      systemPrompt = `You are a content consistency coach.
Create practical, sustainable posting plans.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `I can post ${days} days per week.
My system is:
- 1 viral-style video per active day
- 1 value-style video per active day

Create a simple explanation of my posting plan that:
1. Summarizes how many videos per week
2. Explains the purpose of viral vs value videos
3. Encourages consistency over perfection

Output as JSON:
{
  "days_per_week": ${days},
  "videos_per_day": 2,
  "weekly_total": ${days * 2},
  "summary": "Your posting plan in 2-3 sentences...",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;
    }

    console.log("Generating content for user:", user.id);
    
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
      throw new Error("Unable to generate content. Please try again.");
    }

    const data2 = await response.json();
    const content = data2.choices?.[0]?.message?.content;
    
    let result;
    try {
      const jsonMatch = content.match(/[\[\{][\s\S]*[\]\}]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse content result");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in empire-generate-content:", error);
    return new Response(JSON.stringify({ error: "Unable to generate content. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
