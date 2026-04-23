import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPONENT_VISUALS: Record<string, { name: string; promptFragment: (withLabels: boolean) => string }> = {
  guide: { name: "Main Guide / Ebook", promptFragment: () => "A premium 3D hardcover book with matte finish, realistic paper thickness, slight shadow beneath" },
  worksheet: { name: "Workbook / Worksheet Pack", promptFragment: (withLabels) => withLabels
    ? "Spiral-bound workbook with 3-5 stacked worksheet pages, grid lines visible, header reading exactly 'WORKBOOK', clipboard backing with realistic depth"
    : "Spiral-bound workbook with 3-5 stacked blank worksheet pages, subtle grid lines, NO TEXT, NO HEADERS, NO LABELS visible, clipboard backing with realistic depth" },
  checklist: { name: "Checklist", promptFragment: (withLabels) => withLabels
    ? "Single clean checklist page with 5-7 visible checkmarks, header reading exactly 'CHECKLIST', minimal text blocks, clean design"
    : "Single clean page with 5-7 visible checkmark marks (no words next to them), NO HEADER TEXT, NO LABELS, minimal clean design" },
  resourceList: { name: "Cheat Sheet / Resource List", promptFragment: (withLabels) => withLabels
    ? "Laminated-style card with icon bullets, header reading exactly 'BONUS', compact professional layout, glossy finish"
    : "Laminated-style card with icon bullets only, NO TEXT, NO HEADERS, NO LABELS, compact professional layout, glossy finish" },
  templates: { name: "Template Pack", promptFragment: (withLabels) => withLabels
    ? "Layered swipe-file sheets with header bars reading exactly 'TEMPLATE', visible depth between sheets, branded folder behind"
    : "Layered blank swipe-file sheets, NO TEXT, NO HEADERS, NO LABELS, visible depth between sheets, plain folder behind" },
  quiz: { name: "Prompt Library", promptFragment: (withLabels) => withLabels
    ? "Card-style document with header reading exactly 'SWIPE FILE', clean modern design"
    : "Card-style document showing abstract numbered rows, NO TEXT, NO HEADERS, NO LABELS, clean modern design" },
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
1. ONLY include the EXACT components specified — NO extras, NO duplicates.
2. Composition: hero book centered front, supporting items fanned tightly behind it in a tight arc, items overlapping the hero by ~10% so the bundle reads as ONE cohesive stack (NOT floating separately).
3. Must look like $297-$997 premium product photography (3D, 25° tilt, soft contact shadows, rim light, subtle bloom).
4. TYPOGRAPHY ON THE HERO COVER: Render the EXACT title text given, fully contained inside the cover with generous safe margins (≥10% padding on every side). Title MUST NOT overflow, MUST NOT clip, MUST NOT continue off the edge. If the title is long, scale it down — never crop. Use 1-3 lines max, perfectly balanced.
5. Spell every visible word correctly. NO partial words, NO truncated text, NO lorem ipsum, NO invented words on side props.
6. Background: subtle dark studio gradient with soft vignette. Tight floor shadow under the entire bundle.

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
  includeSubtitle?: boolean;
  includeSideLabels?: boolean;
  maxCoverWords?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json() as EcoverRequest;
    const includeSubtitle = body.includeSubtitle ?? false;
    const includeSideLabels = body.includeSideLabels ?? false;
    const maxCoverWords = body.maxCoverWords ?? 6;
    const rawTitle = body.title || body.productTitle || "Digital Product";
    // Strip anything after a colon or em-dash, then hard cap word count for legibility
    const beforeBreak = rawTitle.split(/[:—–]/)[0].trim() || rawTitle.trim();
    const title = beforeBreak.split(/\s+/).slice(0, maxCoverWords).join(" ");
    const subtitle = includeSubtitle ? (body.subtitle || "").slice(0, 60) : "";
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
      const componentDescs = validComponents.map(c => `${COMPONENT_VISUALS[c].name}: ${COMPONENT_VISUALS[c].promptFragment(includeSideLabels)}`);

      const labelRule = includeSideLabels
        ? `Side prop labels may ONLY display these EXACT words, spelled correctly: WORKBOOK, CHECKLIST, TEMPLATE, SWIPE FILE, BONUS. Do NOT invent, abbreviate, or truncate any other words.`
        : `Side props (workbook, checklist, templates, etc.) MUST be rendered with NO TEXT, NO HEADERS, NO LABELS, NO WORDS — completely blank covers. Do not invent any words on side items.`;

      const titleRule = includeSubtitle && subtitle
        ? `RENDER ONLY the title "${title}" with subtitle "${subtitle}" on the main book cover — no body paragraph, no extra tagline.`
        : `RENDER ONLY the title text "${title}" on the main book cover. Do NOT render a subtitle, tagline, body paragraph, or any descriptive sentence. The cover must contain ONLY the title and a small author/brand mark.`;

      const enhancedParams = [
        `Product Title: "${title}"`,
        includeSubtitle && subtitle ? `Subtitle: "${subtitle}"` : '',
        `Niche: ${niche}`,
        productConcept ? `Product Description: ${productConcept}` : '',
        uniqueMechanism ? `Unique Selling Point: ${uniqueMechanism}` : '',
        body.designColors ? `Color Palette: ${body.designColors}` : '',
        body.designTypography ? `Typography: ${body.designTypography}` : '',
        body.designMood ? `Visual Mood: ${body.designMood}` : '',
        body.sceneLayout ? `Scene Layout: ${body.sceneLayout}` : '',
        body.priceTier ? `Price Tier Aesthetic: ${body.priceTier} product (match perceived value)` : '',
        `Target Audience: ${body.targetAudience || 'general audience'}`,
        `Components (${validComponents.length} items — ONLY THESE): ${componentDescs.join('; ')}`,
        `Depth: ${depthMode === 'stacked' ? 'layered 3D with depth variation, 25° perspective angles, individual drop shadows' : 'flat minimal arrangement'}`,
        `REQUIRED EFFECTS: 3D perspective at 25° angle, soft drop shadows beneath each item, light reflection on glossy surfaces, background gradient, professional product photography lighting from top-left`,
        `TYPOGRAPHY RULE: All rendered text must be sharply legible, correctly spelled English. NO partial words, NO truncated text, NO placeholder lorem ipsum, NO fake brand names, NO invented words.`,
        titleRule,
        labelRule,
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

    // STAGE 2: Generate image with Gemini Image model
    console.log("Stage 2: Image generation via Lovable AI...");
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: customPrompt }],
        modalities: ["image", "text"]
      })
    });

    if (!imageResponse.ok) {
      const err = await imageResponse.text();
      console.error("Image API error:", imageResponse.status, err);
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image in response");

    console.log("eCover generated successfully");

    return new Response(JSON.stringify({
      imageUrl: imageUrl,
      componentsRendered: validComponents,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("generate-ecover error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate graphic. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
