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

    // Build style-specific descriptions with enhanced spacing notes
    const styleDescriptions: Record<string, string> = {
      minimalist: "Clean lines, generous whitespace (40%+ of frame), each element isolated with breathing room, subtle shadows, elegant simplicity, refined typography, modern minimalist aesthetic",
      bold: "Vibrant colors, strong contrasts, dynamic angles, energetic composition, eye-catching design with powerful visual impact, clear separation between elements",
      futuristic: "Tech-inspired gradients, geometric patterns, holographic edges, floating elements with subtle glow underneath each component, neon accents, modern SaaS aesthetic, sleek glass-morphism surfaces",
      professional: "Corporate elegance, boardroom-ready presentation, components arranged like a premium unboxing experience, muted tones, sophisticated layout, business-focused, trustworthy premium appearance",
      creative: "Artistic flair, unique textures, unexpected compositions, standout visual identity with creative edge, generous negative space between artistic elements",
    };

    // Component-to-visual mapping: Maps toolkit components to specific visual elements
    const componentToVisualMap: Record<string, { visual: string; device?: string }> = {
      "guide": { visual: "thick 3D hardcover book (200+ pages feel) with embossed title, positioned center-left as HERO element", device: "book" },
      "worksheet": { visual: "spiral-bound notebook with visible metal rings, slightly fanned open showing lined pages", device: "notebook" },
      "checklist": { visual: "laminated checklist cards fanned out like playing cards, showing checkbox graphics with checkmarks", device: "cards" },
      "resource list": { visual: "modern folder with color-coded document tabs peeking out, papers visible", device: "folder" },
      "templates": { visual: "MacBook Pro displaying dashboard/editor UI with charts and KPIs", device: "laptop" },
      "quiz": { visual: "iPad tablet showing interactive quiz/funnel interface", device: "tablet" },
      "email sequence": { visual: "iPhone showing mobile companion app with checklist/progress UI", device: "phone" },
      "sales letter": { visual: "additional screen/tablet showing sales page preview", device: "tablet" },
    };

    // Build visual elements list from actual components
    const buildComponentVisuals = (components: string[]): string[] => {
      const visuals: string[] = [];
      const defaultComponents = ["guide", "worksheet", "checklist", "resource list", "templates"];
      const compsToUse = components.length > 0 ? components : defaultComponents;
      
      compsToUse.forEach(comp => {
        const key = Object.keys(componentToVisualMap).find(k => 
          comp.toLowerCase().includes(k.toLowerCase()) || k.includes(comp.toLowerCase())
        );
        if (key) {
          visuals.push(`- ${comp.toUpperCase()}: ${componentToVisualMap[key].visual}`);
        } else {
          visuals.push(`- ${comp}: premium printed materials or digital asset display`);
        }
      });
      
      return visuals;
    };

    const visualElements = buildComponentVisuals(componentsIncluded || []);
    const componentsText = `BUNDLE COMPONENTS TO VISUALIZE:\n${visualElements.join("\n")}`;

    // Build mockup-specific descriptions for digital product bundles
    const mockupDescriptions: Record<string, string> = {
      "premium-bundle": `Ultra-premium digital product bundle hero image in the style of high-end SaaS product launches:

COMPOSITION & LAYOUT (Critical):
- Dark gradient background (#0a0a12 to #1a1a2e) with subtle reflective surface beneath products
- Glowing cyan/teal arc (${primary}) sweeping elegantly from left to right, connecting all elements
- Products arranged in elegant arc formation: Book (left) → Laptop (center-back) → Tablet (right) → Phone (far right)
- Scattered worksheets/documents anchoring the bottom-center
- LARGE product title "${title}" rendered in center using ${primary} accent with modern bold typography

DEVICE MOCKUPS (All must be present and premium):
${visualElements.join("\n")}

LIGHTING & EFFECTS:
- Soft studio lighting from top-left (45 degrees)
- Each item casts individual realistic shadow
- Subtle rim lighting on device edges (${primary} tint)
- Glowing arc/swoosh effect connecting elements (${primary})
- Clean ambient occlusion where products meet surface

TYPOGRAPHY (Product Title):
- Large, bold product title in center-bottom or center
- Use mixed typography: lighter word + bold keyword (like "4-hour offer ACCELERATOR")
- ${primary} accent on key word
- Modern sans-serif font style

FINAL REQUIREMENTS:
- 1920x1080 landscape, sales-page hero quality
- Should look like a $497-$997 premium digital system
- Professional enough for WarriorPlus, Gumroad, ClickBank front pages
- NO cluttered elements - generous spacing between all items
- Ready for immediate commercial use`,
      "3d-book": "3D hardcover book mockup with realistic shadows and depth, slightly angled perspective showing cover and spine, premium binding details, generous space around the book",
      "laptop": "Digital product displayed on a premium MacBook Pro screen with modern minimalist workspace background, soft ambient lighting, clean desk with space around device",
      "floating-pages": "Floating paper pages with soft individual shadows, arranged in an artistic scattered pattern with generous gaps between each page, suggesting multiple resources and worksheets",
      "phone-mockup": "Product displayed on a modern iPhone screen with clean gradient background and ample negative space, suggesting mobile-friendly digital access",
      "tablet": "Premium iPad displaying the product cover with elegant accessories nearby, suggesting digital toolkit accessibility, clean surface with breathing room",
      "bundle-stack": `Premium digital product bundle hero display: Elegantly spaced 3D arrangement on a clean surface - main guide as thick hardcover book (center-left, prominent), spiral-bound worksheets with visible metal rings (center-right, slightly behind), laminated checklist cards fanned out artfully (front-left), resource folder with visible color-coded document tabs peeking out (front-right), and bonus template sheets scattered artfully (back). CRITICAL: Each element has generous breathing room (15-20% gaps) between components. Individual realistic drop shadows and ambient occlusion for each piece. Clean gradient background with soft studio lighting from top-left and subtle rim lighting for premium depth.`,
    };

    // Detect if this is a bundle/toolkit type product
    const isPremiumBundle = mockup === "premium-bundle";
    const isBundleProduct = isPremiumBundle || mockup === "bundle-stack" || 
      title.toLowerCase().includes("toolkit") || 
      title.toLowerCase().includes("bundle") ||
      title.toLowerCase().includes("system") ||
      title.toLowerCase().includes("blueprint");

    // Build premium bundle-specific prompt with enhanced spacing and detail
    const bundlePromptAddition = (isBundleProduct && !isPremiumBundle) ? `
CRITICAL BUNDLE VISUALIZATION REQUIREMENTS:

SPACING & ARRANGEMENT:
- Leave GENEROUS negative space between each component (at least 15-20% gaps between items)
- Fan out components in an elegant arc or diagonal arrangement, minimal overlapping
- Use rule of thirds composition with main product at key intersection point
- Components should BREATHE - not crowded or touching each other

DETAILED COMPONENT RENDERING:
${visualElements.join("\n")}

LIGHTING & SHADOWS:
- Each component casts its OWN individual realistic shadow for depth and separation
- Soft directional studio lighting from top-left (45 degrees)
- Subtle rim lighting on edges for premium dimensional feel
- Ambient occlusion where components meet the surface

SCALE & COMPOSITION:
- Components should be LARGE and clearly distinguishable, filling the frame generously (80% fill)
- Clean gradient or subtle textured surface background, not distracting
- Premium unboxing experience aesthetic
- Each item should be instantly recognizable as a distinct valuable component` : "";

    // For premium-bundle, use the mockup description directly as it's comprehensive
    const prompt = isPremiumBundle 
      ? `Create a premium, sales-ready digital product bundle hero image:

PRODUCT DETAILS:
Title: "${title}"
${subtitle ? `Subtitle: "${subtitle}"` : ""}
${authorName ? `By: ${authorName}` : ""}
Niche/Topic: ${niche}

${mockupDescriptions["premium-bundle"]}

COLOR SCHEME:
- Primary accent: ${primary} (for glowing arc, title accents, rim lighting)
- Background: ${secondary} transitioning to darker (#0a0a12)

${additionalElements ? `ADDITIONAL ELEMENTS: ${additionalElements}` : ""}

CRITICAL REQUIREMENTS:
- Ultra-professional, high-ticket digital product aesthetic
- Clean, SPACIOUS composition with clear focal point
- Perfect for sales pages and marketing materials
- Eye-catching hero image that converts browsers to buyers
- NO cluttered elements - generous 15-20% spacing between all items
- Ready for immediate commercial use on any marketplace`
      : `Create a premium, sales-ready digital product bundle hero image:

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
- Clean, SPACIOUS composition with clear focal point and breathing room
- Perfect for sales pages, marketing materials, and social media
- Eye-catching hero image that converts browsers to buyers
- 16:9 landscape aspect ratio, optimized for web display at 1920x1080
- Premium digital product aesthetic with modern design sensibility
- Individual realistic shadows for each component, ambient lighting with rim highlights
- NO text overlays - clean product visualization only
- Should look like a $497+ premium digital product bundle
- Ready for immediate commercial use on any marketplace
- IMPORTANT: Generous spacing between all elements, no crowding`;

    // Use FAL AI (flux-pro) for high-quality image generation with larger dimensions
    const response = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: {
          width: 1920,
          height: 1080
        },
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
