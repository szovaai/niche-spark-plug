import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogoRequest {
  brandName: string;
  // New: Single natural language prompt
  brandDescription?: string;
  // Legacy: Structured fields for advanced mode
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  brandStyle?: string;
  keyElements?: string;
  logoStyle?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      brandName, 
      brandDescription,
      tagline, 
      primaryColor, 
      secondaryColor, 
      brandStyle, 
      keyElements, 
      logoStyle 
    } = await req.json() as LogoRequest;
    
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY is not configured");
    }

    console.log(`Generating logo for: ${brandName}`);
    console.log(`Mode: ${brandDescription ? 'Single Prompt' : 'Advanced'}`);

    let prompt: string;

    if (brandDescription) {
      // New: Single prompt mode - let AI infer everything
      prompt = `Create a distinctive, professional logo for the brand "${brandName}".

Brand description and vibe:
${brandDescription}

Requirements:
- Infer the ideal color palette from the description
- Choose the most appropriate logo style (wordmark, icon, geometric, abstract, etc.)
- Clean, professional, and unique design
- Simple enough to work at small sizes
- Modern and memorable
- Suitable for digital products and toolkits
- Square format with solid or gradient background
- High contrast and readable
- Vector-style crisp edges
- Do NOT include any text in the logo unless it's a wordmark style`;
    } else {
      // Legacy: Structured prompt for advanced mode
      prompt = `Create a distinctive, professional logo for the brand "${brandName}".
${tagline ? `Tagline: ${tagline}` : ""}
Color scheme: ${primaryColor || "#00d4ff"} as primary color and ${secondaryColor || "#1a1a2e"} as secondary/accent color.
Brand style: ${brandStyle || "modern"}
${keyElements ? `Key elements to incorporate: ${keyElements}` : ""}
Logo style: ${logoStyle || "abstract-icon"}

Requirements:
- Clean, professional, and unique design
- Simple enough to work at small sizes
- Modern and memorable
- Suitable for digital products and toolkits
- Square format with transparent or solid background
- High contrast and readable
- Vector-style crisp edges`;
    }

    const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FAL API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`FAL API error: ${response.status}`);
    }

    const data = await response.json();
    
    // FAL returns images array with url property
    const imageUrl = data.images?.[0]?.url;

    if (!imageUrl) {
      console.error("No image in FAL response:", data);
      throw new Error("Failed to generate logo image");
    }

    console.log(`Successfully generated logo for ${brandName}`);

    return new Response(JSON.stringify({ 
      imageUrl,
      prompt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-logo error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
