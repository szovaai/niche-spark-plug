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

interface PromptBoxData {
  whatProductIs: string;
  whoItsFor: string;
  mainProblem: string;
  desiredOutcome: string;
  bonusesIncluded: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { 
      phase = "legacy", // "raw", "polish", or "legacy" for backwards compatibility
      title, 
      subtitle, 
      niche, 
      targetAudience, 
      components, 
      price, 
      authorName, 
      keyBenefits, 
      uniqueMechanism,
      contentSummary,
      promptBoxData,
      rawDraft
    } = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not configured");

    const activeComponents = Object.entries(components || {}).filter(([_, enabled]) => enabled).map(([name]) => name);
    
    let prompt = "";
    let systemPrompt = "";
    
    // PHASE 1: RAW DRAFT - Conversational, unpolished, clarity-focused
    if (phase === "raw") {
      const pb = promptBoxData as PromptBoxData;
      
      systemPrompt = `You are a friendly copywriter helping someone explain their product clearly. 
You write like you're explaining something to a friend over coffee - honest, direct, helpful.
NO hype. NO fake stats. NO testimonials. NO urgency tactics. Just pure clarity.`;

      prompt = `Write a first draft sales letter for "${title}". This is a "thinking draft" - not polished, not persuasive, just CLEAR.

PRODUCT DETAILS FROM USER:
${pb?.whatProductIs ? `• What it is: ${pb.whatProductIs}` : `• Product: ${title} - a digital toolkit in the ${niche} niche`}
${pb?.whoItsFor ? `• Who it's for: ${pb.whoItsFor}` : `• Audience: ${targetAudience || "online entrepreneurs"}`}
${pb?.mainProblem ? `• Problem it solves: ${pb.mainProblem}` : ""}
${pb?.desiredOutcome ? `• Desired outcome: ${pb.desiredOutcome}` : ""}
${pb?.bonusesIncluded ? `• What's included: ${pb.bonusesIncluded}` : `• Components: ${activeComponents.join(", ")}`}

PRICE: $${price || 17}

REQUIREMENTS FOR THIS RAW DRAFT:
1. Write in a natural, conversational tone
2. NO fake statistics or made-up numbers
3. NO fake testimonials or case studies
4. NO hype language or pressure tactics
5. Focus entirely on CLARITY - help the reader understand what this is and why it matters
6. Use simple language - no jargon
7. Be honest about what the product is and isn't

STRUCTURE (keep it simple):
- Open with a relatable situation or problem
- Explain what the product is clearly
- List what's included (if provided)
- Explain the main benefit/transformation
- Simple closing with price

This should feel like: "Here's what this is and why it might help you."

Format as clean HTML with basic styling. Keep paragraphs short.`;

    // PHASE 2: POLISH - Apply the Proprietary Framework
    } else if (phase === "polish") {
      systemPrompt = `You are a master direct-response copywriter who specializes in converting readers into buyers.
You take raw, honest copy and transform it using proven persuasion frameworks while keeping authenticity.
You never add fake testimonials or made-up statistics - you enhance structure and emotional resonance.`;

      prompt = `Take this raw sales letter draft and REWRITE it using our Proprietary Salesletter Framework (AICPBSAWN).

=== RAW DRAFT TO POLISH ===
${rawDraft}

=== FRAMEWORK TO APPLY ===
A = ATTENTION: Pattern-interrupt headline that stops the scroll. Make it specific to the offer.
I = INTEREST: Hook them with a relatable story, surprising insight, or "aha moment" about their problem.
C = CREDIBILITY: Establish why this solution works (without fake testimonials - use logic, specificity, or methodology).
P = PROVE: Use specifics from the product content. Reference actual chapters, methods, or frameworks included.
B = BENEFITS: Transform features into concrete outcomes. Make benefits specific and measurable where possible.
S = SCARCITY: Add genuine reason to act now (limited launch price, bonus expiration, etc.)
A = ACTION: Clear, compelling call-to-action with button-style formatting.
W = WARN: What happens if they don't solve this problem? Paint the cost of inaction.
N = NOW: Final urgency push and confident close.

=== ADDITIONAL CONTEXT ===
Product: ${title}
${subtitle ? `Subtitle: ${subtitle}` : ""}
Niche: ${niche}
Target Audience: ${(promptBoxData as PromptBoxData)?.whoItsFor || targetAudience || "digital entrepreneurs"}
Price: $${price || 17}
Components: ${activeComponents.join(", ")}

=== CRITICAL RULES ===
1. Keep the authentic voice from the raw draft
2. DO NOT invent fake testimonials or statistics
3. Make the headline SPECIFIC to this product, not generic
4. Reference actual product components/chapters where possible
5. Format as professional HTML with modern styling classes
6. Add visual hierarchy with subheadlines, bullet points, and call-out boxes
7. Include a styled "Buy Now" button section
8. The final version should feel premium and conversion-optimized`;

    // LEGACY MODE - Original behavior for backwards compatibility
    } else {
      systemPrompt = "You are an expert copywriter who writes sales letters that feel personal and specific, never generic. You reference actual product content to build credibility.";
      
      if (contentSummary) {
        const summary = contentSummary as ContentSummary;
        
        prompt = `Write a complete, high-converting AICPBSAWN sales letter for "${title}" in the ${niche} niche.

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
        prompt = `Write a complete AICPBSAWN sales letter for "${title}" in ${niche} targeting ${targetAudience || "entrepreneurs"}. Price: $${price || 17}. Components: ${activeComponents.join(", ")}. ${keyBenefits?.length ? `Benefits: ${keyBenefits.join(", ")}` : ""} ${uniqueMechanism ? `Unique mechanism: ${uniqueMechanism}` : ""} Format as clean HTML.`;
      }
    }

    console.log(`Generating ${phase} sales letter for:`, title);

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: "deepseek-chat", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: phase === "raw" ? 0.7 : 0.8,
        max_tokens: phase === "raw" ? 2500 : 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const salesLetter = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ salesLetter, phase }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
