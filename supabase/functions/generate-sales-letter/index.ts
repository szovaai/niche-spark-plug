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

// DigiStream Conversion Pattern - Proprietary Framework
const DCP_FRAMEWORK = `
=== DIGISTREAM CONVERSION PATTERN (DCP) ===

CORE PHILOSOPHY:
Conversion comes from: Clarity → Belief → Momentum → Action
NOT from hype, stories, or authority alone.

This pattern balances the best-performing mechanics from proven copywriting into one 
repeatable system that works across all traffic types.

=== DCP SECTIONS (APPLY IN THIS EXACT ORDER) ===

1. PRECISION HOOK (Clarity First)
   - Immediately tell: Who this is for + What problem it solves + Why keep reading
   - NO hype, NO curiosity tricks, NO vague claims
   - Be specific and direct
   - Example: "Build buyer-intent traffic from Facebook Groups — without ads, spamming, or daily posting."

2. CONTEXTUAL RELEVANCE (Relatable Reality)
   - Make reader feel: "This matches what I'm dealing with right now"
   - Focus on situations, not personal backstory
   - Short and grounded (2-3 sentences max)
   - Empathetic but not dramatic

3. THE REAL PROBLEM (Reframe)
   - Explain why past attempts didn't work
   - Not their fault - the problem is structural
   - Root cause clarity: "Traffic isn't the problem. Intent mismatch is."
   - Diagnose the hidden issue

4. THE SHIFT (New Way of Thinking)
   - Introduce the mental model behind the solution
   - ONE idea only, easy to remember
   - This is where belief changes
   - The "aha moment" they've been missing

5. THE SYSTEM (Logical Proof)
   - Answer: "How does this actually work?"
   - Use steps, pillars, or simple sequences
   - No fluff, no mystique
   - Confidence through clarity

6. THE OFFER REVEAL (Low Pressure)
   - Present product as the natural next step
   - A tool, not a miracle
   - Calm confidence > excitement
   - Position as reducing effort, not promising magic

7. WHAT'S INCLUDED (Value Clarity)
   - Each item answers: What it is + What it helps with + Why it matters
   - Feature → Benefit breakdown
   - Use EXACT components from raw draft
   - No invented bonuses

8. USAGE PATH (Momentum Builder)
   - Day 1: [Quick Win]
   - Day 2: [Next Step]  
   - Day 3: [Result]
   - Show how fast they can get value

9. FIT FILTER (Trust Builder)
   - "This is perfect for you if..."
   - "This is NOT for you if..."
   - Qualification increases trust AND conversions
   - Be honest about who should skip this

10. CALM CLOSE (Action Without Pressure)
    - Invite action without scarcity abuse or fake urgency
    - Confident CTA: "Get instant access for $X"
    - No aggression, no countdown timers, no "only 7 left"
    - Trust the value to speak for itself
`;

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
      rawDraft,
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

    // PHASE 2: POLISH - Apply DigiStream Conversion Pattern WITHOUT re-interpreting the offer
    } else if (phase === "polish") {
      systemPrompt = `You are a conversion-focused copywriter applying the DigiStream Conversion Pattern to an existing draft.

You enhance structure and persuasion WITHOUT changing what the offer is.
You NEVER add fake testimonials, made-up statistics, or invented claims.
You work ONLY with the raw draft provided - do not re-interpret or change the core offer.

TONE: Calm confidence. Clarity over hype. Trust over urgency.`;

      prompt = `Take this EXACT raw draft and restructure it using the DigiStream Conversion Pattern (DCP).

=== RAW DRAFT (preserve the offer EXACTLY as described) ===
${rawDraft}

${DCP_FRAMEWORK}

=== CRITICAL RULES ===
1. Keep the SAME offer, price, and components from the raw draft - DO NOT change them
2. DO NOT invent fake testimonials or statistics
3. DO NOT use hype words like "breakthrough", "revolutionary", "secret", "amazing"
4. Apply calm confidence throughout - not excitement or pressure
5. Use the transformation language from the raw draft
6. Format as professional HTML with:
   - Clear section headings (h2, h3)
   - Styled bullet points for benefits
   - A prominent "Get Instant Access" button section
   - Visual hierarchy with subheadlines
   - Clean, readable paragraphs (2-3 sentences max)

=== ADDITIONAL CONTEXT ===
Product: ${title}
Niche: ${niche}
Target Audience: ${(promptBoxData as PromptBoxData)?.whoItsFor || targetAudience || "digital entrepreneurs"}
Price: $${price || 17}

Remember: Conversion comes from Clarity → Belief → Momentum → Action. 
NOT from hype, pressure, or fake scarcity.`;


    // LEGACY MODE - Original behavior for backwards compatibility
    } else {
      systemPrompt = "You are an expert copywriter who writes sales letters that feel personal and specific, never generic. You reference actual product content to build credibility.";
      
      if (contentSummary) {
        const summary = contentSummary as ContentSummary;
        
        prompt = `Write a complete, high-converting sales letter for "${title}" in the ${niche} niche using the DigiStream Conversion Pattern.

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

COMPONENTS INCLUDED: ${activeComponents.join(", ")}

${DCP_FRAMEWORK}

CRITICAL: Reference ACTUAL chapter content. Use SPECIFIC benefits, not generic marketing fluff. Format as clean HTML.`;

      } else {
        prompt = `Write a complete sales letter for "${title}" in ${niche} targeting ${targetAudience || "entrepreneurs"}. Price: $${price || 17}. Components: ${activeComponents.join(", ")}. ${keyBenefits?.length ? `Benefits: ${keyBenefits.join(", ")}` : ""} ${uniqueMechanism ? `Unique mechanism: ${uniqueMechanism}` : ""} Use the DigiStream Conversion Pattern. Format as clean HTML.`;
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
