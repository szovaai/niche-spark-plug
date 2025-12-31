import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUMAN_TONE_DIRECTIVE = `
Write in a warm, conversational tone that sounds like a real person (not robotic).
- Use contractions naturally (you'll, it's, don't)
- Vary sentence length for rhythm
- Add personality touches ("Here's the thing...", "Pro tip:")
- Write in second person (you, your)
- Avoid corporate buzzwords (leverage, utilize, synergy)
- Sound confident but not salesy
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, nicheName, targetAudience, productType, pricePoint, keyBenefits } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are a viral social media marketing expert specializing in digital product launches.
${HUMAN_TONE_DIRECTIVE}

Generate a complete 7-day launch accelerator kit with content that will CONVERT.

Return a JSON object with this exact structure:
{
  "tiktokScripts": [
    {
      "hook": "Attention-grabbing first 3 seconds",
      "body": "Main content (30-45 seconds)",
      "cta": "Clear call to action",
      "duration": "30s",
      "style": "talking-head"
    }
  ],
  "instagram": {
    "posts": [
      {
        "type": "carousel",
        "caption": "Engaging caption with emojis",
        "hashtags": ["hashtag1", "hashtag2"],
        "slides": ["Slide 1 text", "Slide 2 text", "Slide 3 text"]
      }
    ],
    "stories": [
      {"slide": 1, "content": "Story content", "cta": "Swipe up"}
    ]
  },
  "pinterest": {
    "pins": [
      {
        "title": "SEO-optimized pin title",
        "description": "Pin description with keywords",
        "keywords": ["keyword1", "keyword2"]
      }
    ],
    "boardName": "Board name",
    "boardDescription": "Board description"
  },
  "emails": [
    {
      "subject": "Email subject line",
      "preview": "Preview text",
      "body": "Full email body",
      "sendDay": 1
    }
  ],
  "promoCalendar": [
    {
      "day": 1,
      "date": "Day 1",
      "platform": "TikTok",
      "contentType": "Video",
      "task": "Post teaser video",
      "hook": "Hook to use"
    }
  ],
  "hooks": ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"],
  "hashtags": {
    "tiktok": ["hashtag1", "hashtag2"],
    "instagram": ["hashtag1", "hashtag2"],
    "pinterest": ["hashtag1", "hashtag2"]
  }
}`;

    const userPrompt = `Create a 7-day launch accelerator for:

PRODUCT: ${productName}
NICHE: ${nicheName}
TYPE: ${productType}
TARGET AUDIENCE: ${targetAudience}
PRICE: $${pricePoint}

KEY BENEFITS:
${keyBenefits?.join('\n') || '- High quality digital product\n- Instant download\n- Easy to use'}

Generate:

1. 3-5 TikTok scripts that:
   - Start with scroll-stopping hooks
   - Address pain points
   - Show transformation
   - Include clear CTAs

2. Instagram content:
   - 3 posts (mix of carousel, reels, static)
   - 5-story sequence for launch day
   - Engaging captions with emojis

3. Pinterest:
   - 3 pin ideas with SEO titles
   - Board setup recommendation

4. 2 launch emails:
   - Pre-launch teaser
   - Launch day announcement

5. 7-day promo calendar with daily tasks

6. 5 viral hooks that can be reused

7. Platform-specific hashtag sets (10 each)

Make all content feel authentic and NOT salesy. Focus on helping, not selling.`;

    console.log("Generating launch accelerator for:", productName);

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
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse launch accelerator from AI response");
    }

    const accelerator = JSON.parse(jsonMatch[0]);
    console.log("Launch accelerator generated successfully");

    return new Response(JSON.stringify(accelerator), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating launch accelerator:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
