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
    ? "Spiral-bound workbook with 3-5 stacked pages, fill-in lines, small bar-chart sketch in a corner, tiny circular icon glyphs, ornamental corner flourishes, header reading exactly 'WORKBOOK', clipboard backing with realistic depth, premium matte cardstock"
    : "Spiral-bound workbook with 3-5 stacked pages showing fill-in lines, small bar-chart sketch, tiny circular icon glyphs in corners, decorative corner ornaments, NO TEXT, NO HEADERS, NO LABELS, NO WORDS, clipboard backing with realistic depth, premium matte cardstock — richly designed and detailed" },
  checklist: { name: "Checklist", promptFragment: (withLabels) => withLabels
    ? "Clean checklist page with 6-8 checkmarks beside short horizontal placeholder bars, a star icon, a percent ring graphic, decorative divider line, ornamental border, header reading exactly 'CHECKLIST', glossy laminated finish"
    : "Clean page with 6-8 checkmark icons beside short horizontal placeholder bars, a star icon, a percent ring graphic, decorative divider line, ornamental border, NO TEXT, NO HEADERS, NO LABELS, NO WORDS, glossy laminated finish — richly designed and detailed" },
  resourceList: { name: "Cheat Sheet / Resource List", promptFragment: (withLabels) => withLabels
    ? "Laminated card with icon bullets (link, bookmark, gear, envelope glyphs), thin divider lines, a small QR-style square graphic, gold accent corners, header reading exactly 'BONUS', compact professional layout, glossy finish"
    : "Laminated card with icon bullets (link, bookmark, gear, envelope glyphs only), thin divider lines, a small QR-style square graphic, gold accent corners, compact professional layout, glossy finish, NO TEXT, NO HEADERS, NO LABELS, NO WORDS — richly designed and detailed" },
  templates: { name: "Template Pack", promptFragment: (withLabels) => withLabels
    ? "Layered swipe-file sheets with wireframe boxes, grid placeholders, small color swatch row, dotted dividers, header bars reading exactly 'TEMPLATE', visible depth between sheets, branded kraft folder behind with band"
    : "Layered swipe-file sheets showing wireframe boxes, grid placeholders, small color swatch row, dotted dividers, visible depth between sheets, kraft folder behind with band, NO TEXT, NO HEADERS, NO LABELS, NO WORDS — richly designed and detailed" },
  quiz: { name: "Prompt Library", promptFragment: (withLabels) => withLabels
    ? "Card-style document with numbered circle badges, short bar placeholders, dotted dividers, small icon glyph row, subtle accent stripe, header reading exactly 'SWIPE FILE', clean modern design"
    : "Card-style document with numbered circle badges, short bar placeholders, dotted dividers, small icon glyph row, subtle accent stripe, clean modern design, NO TEXT, NO HEADERS, NO LABELS, NO WORDS — richly designed and detailed" },
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

const PROMPT_WRITER_SYSTEM = `You are a premium eCover design director with 15+ years creating high-ticket digital product mockups. Write ultra-high-quality image generation prompts for photorealistic, RICHLY DETAILED digital product bundle mockups.

CRITICAL RULES:
1. ONLY include the EXACT components specified — NO extras, NO duplicates.
2. Composition: hero book centered front; supporting items fanned tightly behind in a tight arc, overlapping the hero by 15–20%; a second depth row with 1–2 peeking items (folder edge, index card, tab); 1–2 styling accessories (fountain pen, brass paperclip, folded kraft band) for editorial feel; bundle fills 80–85% of the frame (tight crop); ONE unified soft contact shadow under the entire stack.
3. Must look like $297–$997 premium product photography (3D, 25° tilt, soft contact shadows, rim light, subtle bloom). Cinematic studio background: navy-to-charcoal radial gradient centered behind the hero with subtle vignette, faint reflective floor under the bundle, soft rim light from upper-left, gentle bloom on glossy edges.
4. TYPOGRAPHY ON THE HERO COVER: Render the EXACT title text given, fully contained inside the cover with generous safe margins (≥10% padding on every side). Title MUST NOT overflow, MUST NOT clip, MUST NOT continue off the edge. If long, scale down — never crop. 1–3 balanced lines max.
5. HERO COVER LAYOUT (non-text design fills dead space): thin decorative eyebrow band at top in the accent color, bold title block centered occupying 55–65% of the cover height, ornamental divider line under the title, small brand monogram circle bottom-center, subtle background texture (paper grain or soft geometric pattern). NO extra words beyond the title.
6. Spell every visible word correctly. NO partial words, NO truncated text, NO lorem ipsum, NO invented words on side props.
7. Side props must be richly detailed but blank: fill-in lines, icon glyphs, ornamental corners, dotted dividers, color swatches, wireframe boxes, percent rings, numbered badges — never words.

OUTPUT: A single 500–750 word prompt ready for image generation. No headers or explanations.`;

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
        ? `RENDER ONLY the title "${title}" with subtitle "${subtitle}" on the main book cover — no body paragraph, no extra tagline. Title and subtitle MUST fit fully inside the cover with ≥10% safe margin on every side. Scale the type down if needed; NEVER let any letter clip or run off the edge.`
        : `RENDER ONLY the title text "${title}" on the main book cover. Do NOT render a subtitle, tagline, body paragraph, or any descriptive sentence. The cover must contain ONLY the title and a small author/brand mark. Title MUST fit fully inside the cover with ≥10% safe margin on every side, broken across 1-3 balanced lines. Scale the type down if needed; NEVER let any letter clip, hyphenate, or run off the edge.`;

      const compositionRule = `COMPOSITION: One cohesive, editorial bundle, NOT scattered objects. Hero book ~55% of frame width, centered front. Supporting items fan tightly behind in a tight arc, each overlapping the hero by 15–20%. Add a SECOND depth row with 1–2 peeking items (folder edge, index card, tab) for layered depth. Include 1–2 styling accessories — a fountain pen across a corner, a brass paperclip, or a folded kraft band — for editorial feel. Bundle fills 80–85% of the frame (tight crop, item edges close to image bounds). All items share ONE unified soft contact shadow. NO empty floating gaps.`;

      const heroLayoutRule = `HERO COVER LAYOUT (fill dead space with NON-TEXT design): thin decorative eyebrow band at top in the accent color, bold title block centered occupying 55–65% of cover height, ornamental divider line directly under the title, small brand monogram circle bottom-center, subtle background texture (paper grain or soft geometric pattern). Do NOT add extra words, taglines, or sentences beyond the title.`;

      const enhancedParams = [
        `Product Title (render this EXACT text on the cover, nothing else): "${title}"`,
        includeSubtitle && subtitle ? `Subtitle: "${subtitle}"` : '',
        `Niche: ${niche}`,
        productConcept ? `Product Description (for visual mood ONLY — do NOT render this text): ${productConcept}` : '',
        uniqueMechanism ? `Unique Selling Point (visual mood ONLY — do NOT render): ${uniqueMechanism}` : '',
        body.designColors ? `Color Palette: ${body.designColors}` : '',
        body.designTypography ? `Typography: ${body.designTypography}` : '',
        body.designMood ? `Visual Mood: ${body.designMood}` : '',
        body.sceneLayout ? `Scene Layout: ${body.sceneLayout}` : '',
        body.priceTier ? `Price Tier Aesthetic: ${body.priceTier} product (match perceived value)` : '',
        `Target Audience: ${body.targetAudience || 'general audience'}`,
        `Components (${validComponents.length} items — ONLY THESE, no duplicates, no extras): ${componentDescs.join('; ')}`,
        `Depth: ${depthMode === 'stacked' ? 'layered 3D with depth variation, 25° perspective angles, unified soft shadow' : 'flat minimal arrangement'}`,
        compositionRule,
        heroLayoutRule,
        `REQUIRED EFFECTS: 3D perspective at 25° angle, soft contact shadow under the bundle, light reflection on glossy surfaces, navy-to-charcoal radial gradient background centered behind the hero with subtle vignette, faint reflective floor under the bundle, soft rim light from upper-left, gentle bloom on glossy edges, cinematic studio lighting.`,
        `TYPOGRAPHY RULE: All rendered text must be sharply legible, correctly spelled English. NO partial words, NO truncated text, NO clipping at edges, NO placeholder lorem ipsum, NO fake brand names, NO invented words.`,
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
