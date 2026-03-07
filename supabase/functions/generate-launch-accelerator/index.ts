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
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const systemPrompt = `You are a viral social media marketing expert specializing in digital product launches.
${HUMAN_TONE_DIRECTIVE}

Generate a complete 7-day launch accelerator kit with content that will CONVERT.

Return a JSON object with this exact structure:
{
  "tiktokScripts": [{"hook": "", "body": "", "cta": "", "duration": "30s", "style": "talking-head"}],
  "instagram": {"posts": [{"type": "carousel", "caption": "", "hashtags": [], "slides": []}], "stories": [{"slide": 1, "content": "", "cta": ""}]},
  "pinterest": {"pins": [{"title": "", "description": "", "keywords": []}], "boardName": "", "boardDescription": ""},
  "emails": [{"subject": "", "preview": "", "body": "", "sendDay": 1}],
  "promoCalendar": [{"day": 1, "date": "", "platform": "", "contentType": "", "task": "", "hook": ""}],
  "hooks": [],
  "hashtags": {"tiktok": [], "instagram": [], "pinterest": []}
}`;

    const userPrompt = `Create a 7-day launch accelerator for:
PRODUCT: ${productName}
NICHE: ${nicheName}
TYPE: ${productType}
TARGET AUDIENCE: ${targetAudience}
PRICE: $${pricePoint}
KEY BENEFITS: ${keyBenefits?.join('\n') || '- High quality digital product'}

Generate TikTok scripts, Instagram content, Pinterest pins, launch emails, promo calendar, viral hooks, and hashtags.`;

    console.log("Generating launch accelerator for:", productName);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse response");

    return new Response(JSON.stringify(JSON.parse(jsonMatch[0])), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate launch accelerator. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
