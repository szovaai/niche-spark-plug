import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPONENT_VISUALS: Record<string, { name: string; promptFragment: string }> = {
  guide: { name: "Main Guide / Ebook", promptFragment: "A premium 3D hardcover book with matte finish, product title visible on spine and front cover, realistic paper thickness, slight shadow beneath" },
  worksheet: { name: "Workbook / Worksheet Pack", promptFragment: "Spiral-bound workbook with 3-5 stacked worksheet pages, grid lines visible, professional header, clipboard backing with realistic depth" },
  checklist: { name: "Checklist", promptFragment: "Single clean checklist page with 5-7 visible checkmarks, bold header at top, minimal text blocks, clean design" },
  resourceList: { name: "Cheat Sheet / Resource List", promptFragment: "Laminated-style card with icon bullets, compact professional layout, bold header, glossy finish" },
  templates: { name: "Template Pack", promptFragment: "Layered swipe-file sheets with header bars, visible depth between sheets, branded folder behind" },
  quiz: { name: "Prompt Library", promptFragment: "Card-style document showing numbered prompt list format, clean modern design, bold category headers" },
};

const NICHE_KEYWORDS: Record<string, string[]> = {
  finance: ['money', 'finance', 'invest', 'crypto', 'trading', 'wealth', 'income', 'profit'],
  wellness: ['health', 'wellness', 'fitness', 'yoga', 'meditation', 'self-care', 'nutrition'],
  tech: ['tech', 'software', 'saas', 'app', 'coding', 'ai', 'automation'],
  marketing: ['marketing', 'affiliate', 'traffic', 'sales', 'funnel', 'ads', 'seo', 'leads', 'client'],
  coaching: ['coaching', 'mentor', 'mindset', 'success', 'motivation', 'leadership'],
};

function detectNiche(niche: string, title: string): string {
  const text = `${niche} ${title}`.toLowerCase();
  for (const [category, keywords] of Object.entries(NICHE_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return category;
  }
  return 'default';
}

const PROMPT_WRITER_SYSTEM = `You are a premium eCover design director with 15+ years creating high-ticket digital product mockups. Write ultra-high-quality image generation prompts for photorealistic digital product bundle mockups.

CRITICAL RULES:
1. ONLY include the EXACT components specified - NO extras
2. Must look like $297-$997 premium product photography
3. Include 3D perspective angles (25° tilt), drop shadows, lighting gradients, reflections
4. Strong typography hierarchy: Title (large, bold), Subtitle (medium), Tagline (small)
5. Professional depth: subsurface scattering, ambient occlusion, specular highlights
6. Cinematic finishing: color grading, rim lighting, lens bloom

OUTPUT: A single 400-600 word prompt ready for image generation. No headers or explanations.`;

interface EcoverRequest {
  title?: string;
  subtitle?: string;
  productTitle?: string;
  productConcept?: string;
  uniqueMechanism?: string;
  niche?: string;
  targetAudience?: string;
  selectedComponents?: string[];
  stylePreset?: string;
  depthMode?: 'minimal' | 'stacked';
  designStyle?: string;
  designColors?: string;
  designTypography?: string;
  designMood?: string;
  sceneLayout?: string;
  headlineFormula?: string;
  priceTier?: string;
  customPromptOverride?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json() as EcoverRequest;
    const title = body.title || body.productTitle || "Digital Product";
    const subtitle = body.subtitle || "";
    const productConcept = body.productConcept || "";
    const uniqueMechanism = body.uniqueMechanism || "";
    const niche = body.niche || "digital products";
    const selectedComponents = body.selectedComponents || ['guide'];
    const depthMode = body.depthMode || 'stacked';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const validComponents = selectedComponents.filter(c => COMPONENT_VISUALS[c]);
    if (validComponents.length === 0) {
      return new Response(JSON.stringify({ error: "No valid components selected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Generating eCover: ${title}, ${validComponents.length} components, style: ${body.designStyle || 'auto'}`);

    let customPrompt: string;

    if (body.customPromptOverride) {
      // Use direct prompt for ad creatives, hero banners, thumbnails
      customPrompt = body.customPromptOverride;
    } else {
      // Build enhanced prompt with design style engine
      const nicheCategory = detectNiche(niche, title);
      const componentDescs = validComponents.map(c => `${COMPONENT_VISUALS[c].name}: ${COMPONENT_VISUALS[c].promptFragment}`);

      const enhancedParams = [
        `Product Title: "${title}"`,
        subtitle ? `Subtitle: "${subtitle}"` : '',
        `Niche: ${niche}`,
        productConcept ? `Product Description: ${productConcept}` : '',
        uniqueMechanism ? `Unique Selling Point: ${uniqueMechanism}` : '',
        body.designColors ? `Color Palette: ${body.designColors}` : '',
        body.designTypography ? `Typography: ${body.designTypography}` : '',
        body.designMood ? `Visual Mood: ${body.designMood}` : '',
        body.sceneLayout ? `Scene Layout: ${body.sceneLayout}` : '',
        body.headlineFormula ? `Cover Text Formula: ${body.headlineFormula}` : '',
        body.priceTier ? `Price Tier Aesthetic: ${body.priceTier} product (match perceived value)` : '',
        `Target Audience: ${body.targetAudience || 'general audience'}`,
        `Components (${validComponents.length} items — ONLY THESE): ${componentDescs.join('; ')}`,
        `Depth: ${depthMode === 'stacked' ? 'layered 3D with depth variation, 25° perspective angles, individual drop shadows' : 'flat minimal arrangement'}`,
        `REQUIRED EFFECTS: 3D perspective at 25° angle, soft drop shadows beneath each item, light reflection on glossy surfaces, background gradient, professional product photography lighting from top-left`,
        `CRITICAL: The cover text MUST say "${title}"${subtitle ? ` with subtitle "${subtitle}"` : ''}. The imagery must reflect the ${niche} niche and the product concept.`,
      ].filter(Boolean).join('\n');

      // STAGE 1: AI writes custom prompt
      console.log("Stage 1: AI Prompt Writer...");
      const promptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'system', content: PROMPT_WRITER_SYSTEM }, { role: 'user', content: enhancedParams }]
        })
      });

      if (!promptResponse.ok) {
        const status = promptResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        throw new Error("Failed to generate custom prompt");
      }

      const promptData = await promptResponse.json();
      customPrompt = promptData.choices?.[0]?.message?.content;
      if (!customPrompt) throw new Error("No prompt generated");
    }

    // STAGE 2: Generate image with GPT-Image-1
    console.log("Stage 2: Image generation...");
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
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("generate-ecover error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate graphic. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
