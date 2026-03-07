import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUMAN_TONE_DIRECTIVE = `
Write like a real person - not a robot. Use contractions naturally. Vary sentence length. 
Add personality ("Here's the thing...", "Pro tip:", "Real talk:"). Write in second person.
Avoid corporate buzzwords. Sound confident but not salesy. Be helpful and genuine.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint, personalization, nicheName } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }

    const prompt = `You are a viral content strategist creating a 30-day marketing campaign for a digital product.

${HUMAN_TONE_DIRECTIVE}

Product Details:
- Name: ${blueprint.productName}
- Type: ${blueprint.productType}
- Target Audience: ${personalization.targetAudience}
- Transformation: ${personalization.transformationFocus}
- Style: ${personalization.styleVibe}
- Niche: ${nicheName}
- Price Range: $${blueprint.priceRange.min}-${blueprint.priceRange.max}
- Short Description: ${blueprint.marketingCopy?.shortDescription || ""}

Create a comprehensive content pack with:

1. 20 Instagram Posts (mix of carousel captions, single posts, reel captions)
   - Include engaging hooks, value content, and clear CTAs
   - Add 10-15 relevant hashtags per post
   - Assign posting days (1-30)

2. 10 TikTok Scripts (15-60 second videos)
   - Strong hooks that stop the scroll
   - Conversational scripts
   - Clear CTAs
   - Sound suggestions where relevant

3. 10 YouTube Shorts Scripts
   - Attention-grabbing titles
   - Strong hooks
   - Value-packed scripts
   - Subscriber CTAs

4. 1 SEO Blog Post (1500+ words)
   - Compelling title
   - Meta description
   - 5-7 sections with headers
   - Conclusion with CTA
   - 10 SEO keywords

5. 5-Email Nurture Sequence
   - Day 1: Welcome + free value
   - Day 3: Problem agitation
   - Day 5: Solution introduction
   - Day 7: Social proof + offer
   - Day 10: Urgency + final CTA

6. 5 Instagram Carousels (5-7 slides each)
   - Educational content
   - Step-by-step guides
   - Myth-busting content

7. 3 Infographic Concepts
   - Statistics/facts based
   - Process/how-to based
   - Comparison based

8. 1 Lead Magnet Idea
   - Title and format
   - Content outline
   - CTA text

Return as JSON matching this structure:
{
  "instagramPosts": [{"id": 1, "type": "carousel|single|reel-caption", "caption": "", "hashtags": [], "postingDay": 1}],
  "tiktokScripts": [{"id": 1, "hook": "", "script": "", "cta": "", "hashtags": [], "soundSuggestion": ""}],
  "youtubeShorts": [{"id": 1, "title": "", "hook": "", "script": "", "cta": ""}],
  "blogPost": {"title": "", "metaDescription": "", "introduction": "", "sections": [{"heading": "", "content": ""}], "conclusion": "", "seoKeywords": []},
  "emailSequence": [{"day": 1, "subject": "", "previewText": "", "body": "", "cta": ""}],
  "carousels": [{"id": 1, "title": "", "slides": [{"slideNumber": 1, "text": "", "tip": ""}], "caption": ""}],
  "infographics": [{"id": 1, "title": "", "sections": [{"heading": "", "points": []}], "designNotes": ""}],
  "leadMagnet": {"title": "", "format": "", "description": "", "contentOutline": [], "ctaText": ""},
  "contentCalendar": [{"day": 1, "platform": "instagram|tiktok|youtube|email", "contentType": "", "contentId": 1}]
}`;

    console.log("Generating content multiplier for:", blueprint.productName);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are an expert content marketing strategist. Return only valid JSON." },
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
    let contentPack;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contentPack = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("Content multiplier generated successfully");

    return new Response(JSON.stringify(contentPack), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-content-multiplier:", error);
    return new Response(
      JSON.stringify({ error: "Unable to generate content. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
