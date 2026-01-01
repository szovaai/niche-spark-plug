import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EcoverRequest {
  // New simple format from EcoverGenerator
  productName?: string;
  productType?: string;
  aesthetic?: string;
  moodKeywords?: string[];
  ecoverType?: string;
  // Existing detailed format from CoverCreatorFlow
  toolkitTitle?: string;
  subtitle?: string;
  authorName?: string;
  componentsIncluded?: string[];
  coverStyle?: string;
  mockupType?: string;
  primaryColor?: string;
  secondaryColor?: string;
  additionalElements?: string;
  niche?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as EcoverRequest;
    
    // Support both simple and detailed formats
    const title = body.productName || body.toolkitTitle || "Digital Product";
    const style = body.coverStyle || "professional";
    const mockup = body.mockupType || body.ecoverType || "3d-book";
    const primary = body.primaryColor || "#00d4ff";
    const secondary = body.secondaryColor || "#1a1a2e";
    const niche = body.niche || (body.moodKeywords?.join(", ") || "digital product");
    const subtitle = body.subtitle;
    const authorName = body.authorName;
    const componentsIncluded = body.componentsIncluded;
    const additionalElements = body.additionalElements;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${style} cover for: ${title} (${mockup})`);

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

Title: "${title}"
${subtitle ? `Subtitle: "${subtitle}"` : ""}
${authorName ? `Author: ${authorName}` : ""}
Niche: ${niche}
${componentsText}

Visual Style: ${styleDescriptions[style] || styleDescriptions.professional}
Mockup Type: ${mockupDescriptions[mockup] || mockupDescriptions["3d-book"]}
Color Palette: ${primary} as primary, ${secondary} as accent
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

    // Use Lovable AI (Gemini) for image generation
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
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`Image generation error: ${response.status}`);
    }

    const data = await response.json();
    
    // Lovable AI returns images in message.images array
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response:", data);
      throw new Error("Failed to generate cover image");
    }

    console.log(`Successfully generated ${style} cover for ${title}`);

    return new Response(JSON.stringify({ 
      imageUrl,
      coverStyle: style,
      mockupType: mockup,
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
