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
    
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    
    if (!FAL_API_KEY) {
      throw new Error("FAL_API_KEY is not configured");
    }

    console.log(`Generating ${style} cover for: ${title} (${mockup})`);

    // Build style-specific descriptions
    const styleDescriptions: Record<string, string> = {
      minimalist: "Clean lines, generous white space, subtle shadows, elegant simplicity, refined typography, modern minimalist aesthetic",
      bold: "Vibrant colors, strong contrasts, dynamic angles, energetic composition, eye-catching design with powerful visual impact",
      futuristic: "Tech-inspired gradients, geometric patterns, neon accents, modern SaaS aesthetic, sleek glass-morphism surfaces",
      professional: "Corporate elegance, muted tones, sophisticated layout, business-focused, trustworthy premium appearance",
      creative: "Artistic flair, unique textures, unexpected compositions, standout visual identity with creative edge",
    };

    // Build mockup-specific descriptions for digital product bundles
    const mockupDescriptions: Record<string, string> = {
      "3d-book": "3D hardcover book mockup with realistic shadows and depth, slightly angled perspective showing cover and spine, premium binding details",
      "laptop": "Digital product displayed on a premium MacBook Pro screen with modern minimalist workspace background, soft ambient lighting",
      "floating-pages": "Floating paper pages with soft shadows, arranged in an artistic scattered pattern suggesting multiple resources and worksheets",
      "phone-mockup": "Product displayed on a modern iPhone screen with clean gradient background, suggesting mobile-friendly digital access",
      "tablet": "Premium iPad displaying the product cover with elegant accessories nearby, suggesting digital toolkit accessibility",
      "bundle-stack": "Premium digital product bundle display: 3D arrangement showing multiple components - main guide as hardcover book, spiral-bound worksheets, checklist cards, and resource folders stacked together with realistic shadows, suggesting comprehensive value and multiple deliverables",
    };

    // Generate bundle component descriptions for richer prompts
    const bundleComponents = componentsIncluded?.length 
      ? componentsIncluded 
      : ["Core Guide", "Worksheets", "Checklists", "Resource Lists", "Templates"];
    
    const componentsText = `Bundle includes: ${bundleComponents.join(", ")}`;

    // Detect if this is a bundle/toolkit type product
    const isBundleProduct = mockup === "bundle-stack" || 
      title.toLowerCase().includes("toolkit") || 
      title.toLowerCase().includes("bundle") ||
      title.toLowerCase().includes("system") ||
      title.toLowerCase().includes("blueprint");

    // Build premium bundle-specific prompt
    const bundlePromptAddition = isBundleProduct ? `
IMPORTANT BUNDLE VISUALIZATION:
- Show multiple physical product representations: hardcover book for main guide, spiral notebooks for worksheets, laminated cards for checklists, folder with papers for resources
- Arrange in an attractive 3D composition suggesting premium value
- Each component should be visually distinct but color-coordinated
- Add subtle icons or labels suggesting: "Guide", "Worksheets", "Checklists", "Resources"
- Include visual elements like checkmarks, progress indicators, or step numbers
- Style should evoke a premium SaaS dashboard or modern course platform aesthetic
- Add subtle glows, reflections, and depth shadows for premium feel` : "";

    const prompt = `Create a premium, sales-ready digital product bundle hero image:

PRODUCT DETAILS:
Title: "${title}"
${subtitle ? `Subtitle: "${subtitle}"` : "Tagline: Complete System for Success"}
${authorName ? `By: ${authorName}` : ""}
Niche/Topic: ${niche}
${componentsText}

VISUAL STYLE: ${styleDescriptions[style] || styleDescriptions.professional}

MOCKUP TYPE: ${mockupDescriptions[mockup] || mockupDescriptions["bundle-stack"]}

COLOR SCHEME:
- Primary: ${primary} (use for main elements, titles, accents)
- Secondary: ${secondary} (use for backgrounds, subtle details)
- Ensure high contrast and readability
${bundlePromptAddition}

${additionalElements ? `ADDITIONAL ELEMENTS: ${additionalElements}` : ""}

CRITICAL REQUIREMENTS:
- Ultra-professional, WarriorPlus/Gumroad bestseller quality
- Clean, uncluttered composition with clear focal point
- Perfect for sales pages, marketing materials, and social media
- Eye-catching hero image that converts browsers to buyers
- 16:9 landscape aspect ratio, optimized for web display
- Premium digital product aesthetic with modern design sensibility
- Subtle lighting, realistic shadows, and depth for professional feel
- NO text overlays - clean product visualization only
- Should look like a $297+ premium digital product
- Ready for immediate commercial use on any marketplace`;

    // Use FAL AI (flux-pro) for high-quality image generation
    const response = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "landscape_16_9",
        num_images: 1,
        safety_tolerance: "2",
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
