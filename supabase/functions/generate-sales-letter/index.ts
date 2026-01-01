import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContentSummary {
  mainTransformation: string;
  chapterThemes: { chapter: string; theme: string; keyTakeaway: string }[];
  uniqueMechanisms: string[];
  specificBenefits: string[];
  painPointsAddressed: string[];
  quotableInsights: string[];
  tableOfContents: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      title, 
      subtitle, 
      niche, 
      targetAudience, 
      components, 
      price, 
      authorName, 
      keyBenefits, 
      uniqueMechanism,
      contentSummary 
    } = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured");

    const activeComponents = Object.entries(components || {}).filter(([_, enabled]) => enabled).map(([name]) => name);
    
    // Build enhanced prompt with content summary
    let enhancedPrompt = "";
    
    if (contentSummary) {
      const summary = contentSummary as ContentSummary;
      
      enhancedPrompt = `Write a complete, high-converting AICPBSAWN sales letter for "${title}" in the ${niche} niche.

TARGET AUDIENCE: ${targetAudience || "entrepreneurs and digital product creators"}
PRICE: $${price || 17}
AUTHOR: ${authorName || "The Creator"}

=== WHAT THE PRODUCT ACTUALLY TEACHES ===
${summary.tableOfContents?.map((chapter, i) => `${i + 1}. ${chapter}`).join("\n") || "Complete guide"}

=== MAIN TRANSFORMATION ===
${summary.mainTransformation || `Complete system for mastering ${niche}`}

=== CHAPTER THEMES (Reference these in your copy) ===
${summary.chapterThemes?.map(c => `• ${c.chapter}: ${c.theme} — Key insight: "${c.keyTakeaway}"`).join("\n") || ""}

=== UNIQUE MECHANISMS (Use these exact names) ===
${summary.uniqueMechanisms?.map(m => `• "${m}"`).join("\n") || `• The ${title} System`}

=== SPECIFIC BENEFITS (Be concrete, not generic) ===
${summary.specificBenefits?.map(b => `• ${b}`).join("\n") || keyBenefits?.join("\n• ") || ""}

=== PAIN POINTS TO ADDRESS ===
${summary.painPointsAddressed?.map(p => `• ${p}`).join("\n") || ""}

=== QUOTABLE INSIGHTS (Use in testimonial-style callouts) ===
${summary.quotableInsights?.map(q => `"${q}"`).join("\n") || ""}

COMPONENTS INCLUDED: ${activeComponents.join(", ")}

Write the sales letter using the AICPBSAWN framework:
A = Attention (pattern interrupt headline)
I = Interest (hook them with a story or surprising fact)  
C = Credibility (establish authority)
P = Prove (evidence, case studies, specifics from the chapters)
B = Benefits (use the SPECIFIC benefits above, not generic ones)
S = Scarcity (limited time/quantity)
A = Action (clear CTA with button)
W = Warn (what happens if they don't act)
N = Now (final urgency push)

CRITICAL INSTRUCTIONS:
1. Reference ACTUAL chapter content and the unique mechanisms by name
2. Use SPECIFIC benefits from the content, not generic marketing fluff
3. Include the table of contents as a "Here's What You'll Discover" section
4. Quote at least one of the "quotable insights" in a callout box
5. Format as clean, semantic HTML with modern styling classes
6. Make it feel like YOU know exactly what's in this product`;

    } else {
      // Fallback to basic prompt if no content summary
      enhancedPrompt = `Write a complete AICPBSAWN sales letter for "${title}" in ${niche} targeting ${targetAudience || "entrepreneurs"}. Price: $${price || 17}. Components: ${activeComponents.join(", ")}. ${keyBenefits?.length ? `Benefits: ${keyBenefits.join(", ")}` : ""} ${uniqueMechanism ? `Unique mechanism: ${uniqueMechanism}` : ""} Format as clean HTML.`;
    }

    console.log("Generating content-aware sales letter for:", title);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: "You are an expert copywriter who writes sales letters that feel personal and specific, never generic. You reference actual product content to build credibility." },
          { role: "user", content: enhancedPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const salesLetter = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ salesLetter }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
