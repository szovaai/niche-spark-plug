import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Component visual definitions - each maps to exactly ONE visual object
const COMPONENT_VISUALS: Record<string, { name: string; promptFragment: string }> = {
  guide: {
    name: "Main Guide",
    promptFragment: "A premium 3D hardcover book with matte finish, the product title visible on spine and front cover, slight shadow beneath"
  },
  worksheet: {
    name: "Worksheet Pack", 
    promptFragment: "3-5 stacked worksheet pages with subtle grid lines, 'Worksheets' header label visible, optional clipboard backing with realistic depth"
  },
  checklist: {
    name: "Checklist",
    promptFragment: "Single clean checklist page with 5-7 visible checkmarks in a vertical list, 'Checklist' header at top, minimal text blocks"
  },
  resourceList: {
    name: "Resource List",
    promptFragment: "Card-style document with icon bullets representing tools and links, clean professional layout, 'Resources' header"
  },
  templates: {
    name: "Templates",
    promptFragment: "Layered swipe-file style sheets with 'Templates' header bars, visible depth effect between sheets, professional document styling"
  },
  quiz: {
    name: "Quiz",
    promptFragment: "Interactive quiz card showing question format with multiple choice indicators visible, clean modern design"
  }
};

// Layout rules based on component count
const LAYOUT_RULES: Record<string, { range: [number, number]; promptFragment: string }> = {
  'hero-centered': {
    range: [1, 1],
    promptFragment: 'Single product centered on the dark gradient background, dramatic studio lighting from above, floating with soft shadow beneath, commanding presence'
  },
  'side-by-side': {
    range: [2, 2],
    promptFragment: 'Two products arranged side by side with slight angles toward each other, balanced composition, equal visual weight, 20% spacing between items'
  },
  'triangle': {
    range: [3, 3],
    promptFragment: 'Three products arranged in elegant triangle formation, main item (book) slightly elevated at center-top, supporting items at bottom-left and bottom-right, cohesive grouping with 15-20% spacing'
  },
  'fan-stack': {
    range: [4, 5],
    promptFragment: 'Products arranged in elegant fan spread, main book at center, other items fanning outward with slight overlap, 15-20% spacing between items, individual soft shadows for each item'
  },
  'arc': {
    range: [6, 10],
    promptFragment: 'All products arranged in sweeping arc formation across the image, main book at center-front, other items curving behind in an elegant arc, glowing accent connecting elements, balanced visual flow'
  }
};

// Style presets
const STYLE_PRESETS: Record<string, string> = {
  'premium-dark': `BACKGROUND: Rich dark gradient background transitioning from charcoal (#1a1a2e) to near-black (#0a0a0f)
LIGHTING: Professional soft studio lighting from top-left angle, each item casts its own individual realistic shadow
ACCENT: Subtle glowing cyan/teal arc (#00d4ff at 30% opacity) connecting and unifying all elements
FINISH: Premium, high-ticket digital product aesthetic conveying $297+ perceived value
QUALITY: Ultra high detail, professional product photography style, clean and polished`,
  
  'minimal-light': `BACKGROUND: Clean white (#ffffff) to light gray (#f8fafc) gradient, minimalist
LIGHTING: Even, diffused professional studio lighting from multiple angles
ACCENT: Clean, crisp shadows only - no glow effects, subtle depth
FINISH: Modern, minimal SaaS product aesthetic, clean and professional
QUALITY: High detail, product catalog style photography, sharp and clean`,
  
  'warm-premium': `BACKGROUND: Deep charcoal (#1a1a1a) to rich black (#0a0a0a) gradient
LIGHTING: Dramatic warm lighting from top, golden highlights on edges
ACCENT: Warm gold (#d4a574) accent highlights and subtle glow connecting elements
FINISH: Luxury, high-end premium product aesthetic, exclusive feel
QUALITY: Ultra high detail, luxury product photography style`
};

function getLayoutPrompt(count: number): string {
  for (const [, config] of Object.entries(LAYOUT_RULES)) {
    if (count >= config.range[0] && count <= config.range[1]) {
      return config.promptFragment;
    }
  }
  return LAYOUT_RULES['fan-stack'].promptFragment;
}

interface EcoverRequest {
  // Required
  productTitle: string;
  selectedComponents: string[];
  
  // Optional styling
  stylePreset?: string;
  depthMode?: 'minimal' | 'stacked';
  
  // Legacy support
  productName?: string;
  toolkitTitle?: string;
  componentsIncluded?: string[];
  coverStyle?: string;
  niche?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }
    console.log(`Authenticated user: ${user.id}`);

    const body = await req.json() as EcoverRequest;
    
    // Handle both new and legacy request formats
    const title = body.productTitle || body.productName || body.toolkitTitle || "Digital Product";
    const selectedComponents = body.selectedComponents || body.componentsIncluded || [];
    const stylePreset = body.stylePreset || 'premium-dark';
    const depthMode = body.depthMode || 'stacked';
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // CRITICAL: Filter to only valid, selected components
    const validComponents = selectedComponents.filter(c => COMPONENT_VISUALS[c]);
    
    if (validComponents.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No valid components selected. Please select at least one component." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating bundle eCover for: ${title}`);
    console.log(`Selected components (${validComponents.length}): ${validComponents.join(', ')}`);
    console.log(`Style: ${stylePreset}, Depth: ${depthMode}`);

    // Build component prompts - ONLY for selected components
    const componentPrompts = validComponents.map((id, index) => {
      const visual = COMPONENT_VISUALS[id];
      return `${index + 1}. ${visual.name}: ${visual.promptFragment}`;
    });

    // Get layout based on component count
    const layoutPrompt = getLayoutPrompt(validComponents.length);
    
    // Get style preset
    const stylePrompt = STYLE_PRESETS[stylePreset] || STYLE_PRESETS['premium-dark'];
    
    // Depth mode
    const depthPrompt = depthMode === 'minimal' 
      ? 'Flat arrangement with minimal depth, clean and modern, items at similar visual plane'
      : '3D depth with layered stacking, realistic perspective, items at varying depths creating visual hierarchy';

    // Build the final prompt with strict rules
    const prompt = `Create a premium digital product bundle hero image for sales pages.

PRODUCT TITLE: "${title}"

═══════════════════════════════════════════════════════════════
CRITICAL RULES - MUST FOLLOW EXACTLY:
═══════════════════════════════════════════════════════════════
1. ONLY display the EXACT ${validComponents.length} component(s) listed below. NO additional items.
2. NO placeholder items, filler visuals, laptops, tablets, phones, or dashboards.
3. NO fake screens, random devices, or generic stock imagery.
4. Each component maps to exactly ONE visual object as specified.
5. NO text overlays except the product title on the book cover.
6. The image must contain ONLY what is listed - nothing more.
═══════════════════════════════════════════════════════════════

COMPONENTS TO DISPLAY (ONLY THESE ${validComponents.length} ITEMS):
${componentPrompts.join('\n')}

LAYOUT ARRANGEMENT:
${layoutPrompt}

DEPTH STYLE:
${depthPrompt}

VISUAL STYLE:
${stylePrompt}

FORMAT: 1536x1024 landscape, sales-page hero quality

NEGATIVE PROMPT / DO NOT INCLUDE:
- No laptops, tablets, phones, or screens
- No generic dashboards or UI mockups
- No stock photography elements
- No cartoon or flat icon styles
- No Canva-style graphics
- No items not explicitly listed above
- No additional "bonus" or "value" items`;

    console.log("Sending component-aware prompt to OpenAI GPT-Image-1...");

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1536x1024",
        quality: "high",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "OpenAI billing issue. Please check your API key." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("Failed to generate cover image");
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log(`Successfully generated bundle eCover with ${validComponents.length} components`);

    return new Response(JSON.stringify({ 
      imageUrl,
      componentsRendered: validComponents,
      layout: validComponents.length <= 1 ? 'hero-centered' : 
              validComponents.length === 2 ? 'side-by-side' :
              validComponents.length === 3 ? 'triangle' :
              validComponents.length <= 5 ? 'fan-stack' : 'arc',
      stylePreset,
      depthMode
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
