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
    const { productDescription, brandName, productName, color, type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt, userPrompt;

    if (type === "visuals") {
      systemPrompt = `You are a product mockup art director specializing in digital products.
Create prompts that generate clean, modern, premium-looking mockups.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Brand name: ${brandName}
Product name: ${productName}
Main color or aesthetic: ${color || "neutral/modern"}

Create:
1. A prompt for a main hero image/mockup that shows the digital system in a clean, modern way, suitable as a Gumroad cover
2. 3-5 prompts for supporting images that zoom into different parts of the system or show it on multiple devices

Output as JSON:
{
  "hero_prompt": "Detailed prompt for hero image...",
  "detail_prompts": ["Prompt 1...", "Prompt 2...", "Prompt 3..."]
}`;
    } else if (type === "delivery") {
      systemPrompt = `You are an onboarding specialist for digital products.
Create clear, friendly instructions that make customers feel taken care of.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Product name: ${productName}
Product type: Google Sheets system or similar digital download

Write:
1. Step-by-step instructions for the creator on how to set up the Google Sheet so buyers can "Make a copy" easily
2. A short "Thank you + How to use this" message they can paste into Gumroad's delivery field

Output as JSON:
{
  "creator_setup_steps": ["Step 1: ...", "Step 2: ..."],
  "thank_you_message": "Thank you for purchasing!..."
}`;
    } else if (type === "domains") {
      systemPrompt = `You are a naming and domain strategist.
Suggest short, memorable domains that work for digital product stores.

IMPORTANT: Return ONLY valid JSON array, no markdown.`;

      userPrompt = `Brand name: ${brandName}
Product name: ${productName}

Suggest 5 domain ideas that would be great for this Gumroad store or product landing page.
Focus on .store, .io, .co, or .xyz domains.
Keep them short and brandable.

Output as JSON array:
["domain1.store", "domain2.io", "domain3.co"]`;
    } else {
      systemPrompt = `You are a high-converting Gumroad copywriter.
Create listings that feel premium, trustworthy, and beginner-friendly.

IMPORTANT: Return ONLY valid JSON, no markdown.`;

      userPrompt = `Based ONLY on the digital product described below, generate the BEST possible Gumroad listing.

DIGITAL PRODUCT DESCRIPTION: ${productDescription}

Output exactly the following in a JSON object:
{
  "title": "Product title",
  "description": "Full Gumroad description with short paragraphs and bullet points",
  "price": "$XX",
  "price_reason": "Why this price makes sense"
}

Make it feel premium, trustworthy, beginner-friendly, and optimized to sell fast.`;
    }

    console.log("Calling Lovable AI for Gumroad content...");
    
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
      const jsonMatch = content.match(/[\[\{][\s\S]*[\]\}]/);
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
    console.error("Error in empire-generate-gumroad:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
