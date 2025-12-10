import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EcoverRequest {
  productName: string;
  productType: string;
  aesthetic: string;
  primaryColor: string;
  secondaryColor: string;
  moodKeywords: string[];
  ecoverType: "mockup" | "thumbnail" | "pinterest" | "instagram";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productType, aesthetic, primaryColor, secondaryColor, moodKeywords, ecoverType } = await req.json() as EcoverRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${ecoverType} for: ${productName}`);

    // Build prompt based on ecover type
    const prompts: Record<string, string> = {
      mockup: `Create a professional 3D product mockup for a digital product called "${productName}". 
        Product type: ${productType}. 
        Style: ${aesthetic}, ${moodKeywords.join(", ")}. 
        Colors: ${primaryColor} and ${secondaryColor}.
        Show the product displayed on a modern device or as floating pages with soft shadows.
        Clean white or light gradient background. Professional lighting. 
        Etsy bestseller quality. Ultra high resolution.
        16:9 aspect ratio landscape hero image.`,
      
      thumbnail: `Create a stunning Etsy listing thumbnail for "${productName}".
        Product type: ${productType}.
        Style: ${aesthetic}, ${moodKeywords.join(", ")}.
        Colors: ${primaryColor} and ${secondaryColor}.
        Eye-catching composition with the product as hero.
        Clean, professional, premium feel.
        1:1 square aspect ratio.
        Bright, well-lit, Etsy bestseller aesthetic.
        Ultra high resolution.`,
      
      pinterest: `Create a tall Pinterest pin for "${productName}".
        Product type: ${productType}.
        Style: ${aesthetic}, ${moodKeywords.join(", ")}.
        Colors: ${primaryColor} and ${secondaryColor}.
        2:3 tall aspect ratio.
        Eye-catching, scroll-stopping design.
        Include visual of the product with lifestyle context.
        Text overlay style that's readable.
        Pinterest viral aesthetic. Ultra high resolution.`,
      
      instagram: `Create an Instagram post image for "${productName}".
        Product type: ${productType}.
        Style: ${aesthetic}, ${moodKeywords.join(", ")}.
        Colors: ${primaryColor} and ${secondaryColor}.
        1:1 square aspect ratio.
        Clean, modern, aesthetic feed-worthy design.
        Show the product in an aspirational lifestyle context.
        Instagram influencer quality. Ultra high resolution.`,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { 
            role: "user", 
            content: prompts[ecoverType] || prompts.mockup
          }
        ],
        modalities: ["image", "text"],
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
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please upgrade your plan." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract image from the response
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!imageUrl) {
      console.error("No image in response:", data);
      throw new Error("Failed to generate image");
    }

    console.log(`Successfully generated ${ecoverType} for ${productName}`);

    return new Response(JSON.stringify({ 
      imageUrl,
      ecoverType,
      description: textContent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-ecover error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
