import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EcoverRequest {
  productName?: string;
  productType?: string;
  aesthetic?: string;
  moodKeywords?: string[];
  ecoverType?: string;
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
    
    const title = body.productName || body.toolkitTitle || "Digital Product";
    const style = body.coverStyle || "professional";
    const mockup = body.mockupType || body.ecoverType || "premium-bundle";
    const primary = body.primaryColor || "#00d4ff";
    const secondary = body.secondaryColor || "#1a1a2e";
    const niche = body.niche || (body.moodKeywords?.join(", ") || "digital product");
    const subtitle = body.subtitle || "";
    const authorName = body.authorName || "";
    const componentsIncluded = body.componentsIncluded || [];
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log(`Generating ${style} cover for: ${title} (${mockup}) using OpenAI GPT-Image-1`);

    // Build component list for the prompt
    const componentsList = componentsIncluded.length > 0 
      ? componentsIncluded.join(", ")
      : "Guide, Worksheets, Checklists, Templates, Resources";

    // Build a clear, structured prompt for GPT-Image-1 which handles text well
    const prompt = `Create a premium digital product bundle hero image for sales pages:

PRODUCT TITLE: "${title}"
${subtitle ? `SUBTITLE: "${subtitle}"` : ""}
${authorName ? `BY: ${authorName}` : ""}

VISUAL COMPOSITION:
- Premium 3D book mockup with the title "${title}" in bold, modern sans-serif typography on the cover
- MacBook Pro displaying a sleek dashboard UI
- iPad showing app interface
- Scattered worksheets and documents
- All arranged in an elegant arc on a dark gradient surface

STYLE:
- Dark gradient background (${secondary} to darker)
- Glowing ${primary} accent arc connecting elements
- Soft studio lighting from top-left
- Individual realistic shadows for each item
- Premium, high-ticket aesthetic ($497+ value look)

TYPOGRAPHY REQUIREMENTS:
- Title "${title}" must be clearly legible on the book cover
- Use bold, modern sans-serif font
- Clean, professional text rendering
- High contrast against the cover background

COMPONENTS SHOWN: ${componentsList}

FORMAT: 1792x1024 landscape, sales-page hero quality
AESTHETIC: ${style}, premium SaaS product launch style`;

    console.log("Sending prompt to OpenAI GPT-Image-1...");

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
        size: "1792x1024",
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
      
      if (response.status === 400) {
        console.error("Bad request - prompt may have issues:", errorText);
        throw new Error("Invalid request to image API");
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    
    // GPT-Image-1 returns base64 by default in b64_json field
    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("Failed to generate cover image");
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log(`Successfully generated ${style} cover for "${title}" with GPT-Image-1`);

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
