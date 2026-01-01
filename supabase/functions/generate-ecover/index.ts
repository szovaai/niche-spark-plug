import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EcoverRequest {
  toolkitTitle: string;
  subtitle?: string;
  authorName?: string;
  componentsIncluded?: string[];
  coverStyle: string;
  mockupType: string;
  primaryColor: string;
  secondaryColor: string;
  additionalElements?: string;
  niche?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      toolkitTitle, 
      subtitle,
      authorName,
      componentsIncluded, 
      coverStyle, 
      mockupType,
      primaryColor, 
      secondaryColor, 
      additionalElements,
      niche
    } = await req.json() as EcoverRequest;
    
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY is not configured");
    }

    console.log(`Generating ${coverStyle} cover for: ${toolkitTitle} (${mockupType})`);

    // Build style-specific descriptions
    const styleDescriptions: Record<string, string> = {
      minimalist: "Clean lines, generous white space, subtle shadows, elegant simplicity, refined typography",
      bold: "Vibrant colors, strong contrasts, dynamic angles, energetic composition, eye-catching design",
      futuristic: "Tech-inspired gradients, geometric patterns, neon accents, modern aesthetic, sleek surfaces",
      professional: "Corporate elegance, muted tones, sophisticated layout, business-focused, trustworthy appearance",
      creative: "Artistic flair, unique textures, unexpected compositions, standout visual identity",
    };

    // Build mockup-specific descriptions
    const mockupDescriptions: Record<string, string> = {
      "3d-book": "3D hardcover book mockup with realistic shadows and depth, slightly angled perspective showing cover and spine",
      "laptop": "Digital product displayed on a premium laptop screen with modern workspace background",
      "floating-pages": "Floating paper pages with soft shadows, arranged in an artistic scattered pattern",
      "phone-mockup": "Product displayed on a modern smartphone screen with clean background",
      "tablet": "Premium tablet displaying the product cover with elegant accessories nearby",
      "bundle-stack": "Multiple products stacked together showing variety and value, 3D arrangement",
    };

    const componentsText = componentsIncluded?.length 
      ? `Including: ${componentsIncluded.join(", ")}` 
      : "";

    const prompt = `Create a professional, premium-quality digital product cover:

Title: "${toolkitTitle}"
${subtitle ? `Subtitle: "${subtitle}"` : ""}
${authorName ? `Author: ${authorName}` : ""}
${niche ? `Niche: ${niche}` : ""}
${componentsText}

Visual Style: ${styleDescriptions[coverStyle] || styleDescriptions.professional}
Mockup Type: ${mockupDescriptions[mockupType] || mockupDescriptions["3d-book"]}
Color Palette: ${primaryColor} as primary, ${secondaryColor} as accent
${additionalElements ? `Additional elements: ${additionalElements}` : ""}

Requirements:
- Ultra-professional, bestseller quality
- Clean, uncluttered composition
- Perfect for marketing and sales pages
- Eye-catching hero image quality
- 16:9 landscape aspect ratio
- Premium digital product aesthetic
- Subtle lighting and shadows for depth
- Ready for immediate commercial use`;

    const response = await fetch("https://fal.run/fal-ai/seedream-v4", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: { width: 1920, height: 1080 },
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
      throw new Error("Failed to generate cover image");
    }

    console.log(`Successfully generated ${coverStyle} cover for ${toolkitTitle}`);

    return new Response(JSON.stringify({ 
      imageUrl,
      coverStyle,
      mockupType,
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
