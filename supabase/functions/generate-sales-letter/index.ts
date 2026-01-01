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
    
    // PHASE 1: RAW DRAFT - Clarity-focused, no persuasion, just organization
    if (phase === "raw") {
      const pb = promptBoxData as PromptBoxData;
      
      systemPrompt = `You are organizing someone's product description into a clear sales letter format.
You do NOT add persuasion, hype, statistics, or testimonials.
You simply take their input and make it easy to read.
Write like you're explaining something to a friend - honest, direct, helpful.`;

      prompt = `Organize this product information into a CLEAR, SIMPLE sales letter draft.

PRODUCT DETAILS FROM USER:
${pb?.whatProductIs ? `• What it is: ${pb.whatProductIs}` : `• Product: ${title} - a digital toolkit in the ${niche} niche`}
${pb?.whoItsFor ? `• Who it's for: ${pb.whoItsFor}` : `• Audience: ${targetAudience || "online entrepreneurs"}`}
${pb?.mainProblem ? `• Problem it solves: ${pb.mainProblem}` : ""}
${pb?.desiredOutcome ? `• Desired outcome: ${pb.desiredOutcome}` : ""}
${pb?.bonusesIncluded ? `• What's included: ${pb.bonusesIncluded}` : `• Components: ${activeComponents.join(", ")}`}

PRICE: $${price || 17}

=== RULES FOR THIS RAW DRAFT ===
1. NO hype, NO fake stats, NO testimonials
2. NO urgency tactics or pressure
3. Just organize this information clearly
4. Use simple, conversational language
5. Be honest about what the product is

=== STRUCTURE (simple and clear) ===
- Open with a relatable situation or problem (2-3 sentences)
- Explain what the product is clearly (1 paragraph)
- List what's included with brief descriptions
- Explain the main benefit/transformation
- Simple closing with price and call-to-action

This should feel like: "Here's what this is and why it might help you."

Format as clean HTML with <p>, <h2>, <ul>, <li> tags. Keep paragraphs short (2-3 sentences max).`;

    // PHASE 2: POLISH - Apply framework WITHOUT re-interpreting the offer
    } else if (phase === "polish") {
      systemPrompt = `You are a direct-response copywriter applying a proven framework to an existing draft.
You enhance structure and emotional resonance WITHOUT changing what the offer is.
You NEVER add fake testimonials or made-up statistics.
You work ONLY with the raw draft provided - do not re-interpret or change the core offer.`;

      prompt = `Take this EXACT raw draft and restructure it using our Proprietary Salesletter Framework.

=== RAW DRAFT (preserve the offer EXACTLY as described) ===
${rawDraft}

=== FRAMEWORK SECTIONS (apply IN THIS ORDER) ===
1. PRE-HEADLINE: Pattern interrupt or curiosity trigger (1 line)
2. HEADLINE: Specific benefit + transformation promise from the raw draft
3. SUBHEADLINE: Expands on headline, adds credibility without fake claims
4. RELATABLE STORY: Problem they recognize, told in their words (from raw draft's problem)
5. THE REAL PROBLEM: Root cause most people miss - expand on raw draft's problem
6. THE SHIFT: The "aha moment" or new approach this product offers
7. INTRODUCE THE OFFER: What it is, positioned as the solution (from raw draft)
8. WHAT'S INCLUDED: Feature → Benefit breakdown (use EXACT components from raw draft)
9. HOW IT WORKS: Simple 3-step process
10. WHO IT'S FOR / NOT FOR: Qualification section
11. CALM CLOSE: Confident, non-pushy CTA with price ($${price || 17})

=== CRITICAL RULES ===
1. Keep the SAME offer, price, and components from the raw draft - DO NOT change them
2. DO NOT invent fake testimonials or statistics
3. Make the headline SPECIFIC to this exact product
4. Add emotional resonance WITHOUT being fake or salesy
5. Use the transformation language from the raw draft
6. Format as professional HTML with:
   - Clear section headings
   - Styled bullet points for benefits
   - A prominent "Get Instant Access" button section
   - Visual hierarchy with subheadlines

=== ADDITIONAL CONTEXT ===
Product: ${title}
Niche: ${niche}
Target Audience: ${(promptBoxData as PromptBoxData)?.whoItsFor || targetAudience || "digital entrepreneurs"}
Price: $${price || 17}`;


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
    let salesLetter = data.choices?.[0]?.message?.content || "";
    
    // Sanitize AI output before returning
    salesLetter = salesLetter
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2013\u2014\u2015]/g, "-")
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€"/g, "-");

    return new Response(JSON.stringify({ salesLetter, phase }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
