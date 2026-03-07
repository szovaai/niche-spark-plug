import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Component visual definitions
const COMPONENT_VISUALS: Record<string, { name: string; promptFragment: string }> = {
  guide: {
    name: "Main Guide",
    promptFragment: "A premium 3D hardcover book with matte finish, the product title visible on spine and front cover, realistic paper thickness, slight shadow beneath"
  },
  worksheet: {
    name: "Worksheet Pack", 
    promptFragment: "3-5 stacked worksheet pages with subtle grid lines, 'Worksheets' header label visible, optional clipboard backing with realistic depth"
  },
  checklist: {
    name: "Checklist",
    promptFragment: "Single clean checklist page with 5-7 visible checkmarks, 'Checklist' header at top, minimal text blocks"
  },
  resourceList: {
    name: "Resource List",
    promptFragment: "Card-style document with icon bullets representing tools and links, clean professional layout"
  },
  templates: {
    name: "Templates",
    promptFragment: "Layered swipe-file style sheets with 'Templates' header bars, visible depth effect between sheets"
  },
  quiz: {
    name: "Quiz",
    promptFragment: "Interactive quiz card showing question format with multiple choice indicators visible"
  }
};

// Niche detection and style profiles
const NICHE_KEYWORDS: Record<string, string[]> = {
  finance: ['money', 'finance', 'invest', 'crypto', 'trading', 'wealth', 'income', 'profit'],
  wellness: ['health', 'wellness', 'fitness', 'yoga', 'meditation', 'self-care', 'nutrition'],
  tech: ['tech', 'software', 'saas', 'app', 'coding', 'ai', 'automation'],
  marketing: ['marketing', 'affiliate', 'traffic', 'sales', 'funnel', 'ads', 'seo', 'leads'],
  coaching: ['coaching', 'mentor', 'mindset', 'success', 'motivation', 'leadership']
};

const NICHE_STYLES: Record<string, { colors: string; lighting: string; mood: string }> = {
  finance: { colors: 'deep navy with warm gold accents', lighting: 'dramatic warm lighting', mood: 'luxurious and authoritative' },
  wellness: { colors: 'sage green with warm cream accents', lighting: 'soft natural lighting', mood: 'calming and nurturing' },
  tech: { colors: 'charcoal with electric cyan accents', lighting: 'cool studio lighting', mood: 'modern and innovative' },
  marketing: { colors: 'deep black with vibrant orange accents', lighting: 'dynamic three-point lighting', mood: 'energetic and action-oriented' },
  coaching: { colors: 'deep purple with warm beige accents', lighting: 'warm rim glow lighting', mood: 'inspiring and empowering' },
  default: { colors: 'charcoal with teal accents', lighting: 'professional studio lighting', mood: 'professional and premium' }
};

function detectNiche(niche: string, title: string): string {
  const text = `${niche} ${title}`.toLowerCase();
  for (const [category, keywords] of Object.entries(NICHE_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return 'default';
}

function getLayoutPrompt(count: number): string {
  if (count === 1) return 'Single product centered, dramatic hero presentation';
  if (count === 2) return 'Two products side by side with 20% spacing, slight inward angles';
  if (count === 3) return 'Triangle formation, main guide elevated at apex';
  if (count <= 5) return 'Elegant fan spread, 15-20% overlap, main item forward';
  return 'Full arc formation, balanced distribution';
}

// AI Prompt Writer system prompt
const PROMPT_WRITER_SYSTEM = `You are a premium eCover design director. Write ultra-high-quality image generation prompts for photorealistic digital product mockups.

CRITICAL RULES:
1. ONLY include the EXACT components specified - NO extras
2. NO laptops, tablets, phones, screens, or devices
3. NO stock imagery, dashboards, or UI mockups
4. Must look like $297+ premium product photography

Include: brand-calibrated colors, hyperrealistic 3D rendering (subsurface scattering, ambient occlusion, specular highlights), cinematic finishing (color grading, rim lighting, lens bloom), precise composition.

OUTPUT: A single 400-500 word prompt ready for image generation. No headers or explanations.`;

interface EcoverRequest {
  title?: string;
  productTitle?: string;
  niche?: string;
  targetAudience?: string;
  thesis?: string;
  writingStyle?: string;
  selectedComponents?: string[];
  stylePreset?: string;
  depthMode?: 'minimal' | 'stacked';
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

    const body = await req.json() as EcoverRequest;
    const title = body.title || body.productTitle || "Digital Product";
    const niche = body.niche || "digital products";
    const selectedComponents = body.selectedComponents || ['guide'];
    const depthMode = body.depthMode || 'stacked';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!LOVABLE_API_KEY || !OPENAI_API_KEY) {
      throw new Error("Required API keys not configured");
    }

    const validComponents = selectedComponents.filter(c => COMPONENT_VISUALS[c]);
    if (validComponents.length === 0) {
      return new Response(JSON.stringify({ error: "No valid components selected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Generating eCover: ${title}, ${validComponents.length} components`);

    // Detect niche and get style
    const nicheCategory = detectNiche(niche, title);
    const nicheStyle = NICHE_STYLES[nicheCategory] || NICHE_STYLES.default;

    // Build prompt writer message
    const componentDescs = validComponents.map(c => `${COMPONENT_VISUALS[c].name}: ${COMPONENT_VISUALS[c].promptFragment}`);
    const promptMessage = `Create eCover for "${title}" (${niche} niche).
Colors: ${nicheStyle.colors}. Lighting: ${nicheStyle.lighting}. Mood: ${nicheStyle.mood}.
Target: ${body.targetAudience || 'general audience'}. 
Components (ONLY these ${validComponents.length}): ${componentDescs.join('; ')}.
Layout: ${getLayoutPrompt(validComponents.length)}.
Depth: ${depthMode === 'stacked' ? 'layered 3D with depth variation' : 'flat minimal arrangement'}.`;

    // STAGE 1: AI writes custom prompt
    console.log("Stage 1: AI Prompt Writer...");
    const promptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: PROMPT_WRITER_SYSTEM }, { role: 'user', content: promptMessage }]
      })
    });

    if (!promptResponse.ok) {
      console.error("Prompt writer failed:", promptResponse.status);
      throw new Error("Failed to generate custom prompt");
    }

    const promptData = await promptResponse.json();
    const customPrompt = promptData.choices?.[0]?.message?.content;
    if (!customPrompt) throw new Error("No prompt generated");

    console.log("Stage 2: Image generation with custom prompt...");

    // STAGE 2: Generate image
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: customPrompt, n: 1, size: "1536x1024", quality: "high" })
    });

    if (!imageResponse.ok) {
      const err = await imageResponse.text();
      console.error("Image API error:", imageResponse.status, err);
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageBase64 = imageData.data?.[0]?.b64_json;
    if (!imageBase64) throw new Error("No image in response");

    console.log("eCover generated successfully");

    return new Response(JSON.stringify({ 
      imageUrl: `data:image/png;base64,${imageBase64}`,
      componentsRendered: validComponents,
      nicheCategory
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("generate-ecover error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate ecover. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
