import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateAuth, unauthorizedResponse } from "../_shared/auth.ts";

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

// Kennedy Direct-Response Letter HTML structure prompt
const KENNEDY_HTML_STRUCTURE = `
=== OUTPUT FORMAT: KENNEDY-STYLE DIRECT RESPONSE LETTER HTML ===

Generate the sales letter as CLEAN HTML that matches the Dan Kennedy direct-response letter aesthetic.
This is a cream-colored, serif-font, letter-style sales page — NOT a modern dark theme.

REQUIRED HTML STRUCTURE (use these exact class names and structure):

1. URGENCY BAR:
<div class="urgency-bar">
  [Short urgency message — e.g. "⚠ Founding Member Pricing Expires When This Page Closes"]
</div>

2. LETTER HEADER:
<div class="letter-header">
  <p class="from-desk">An Urgent Letter To:</p>
  <p class="sender">[Describe the target audience in one compelling sentence]</p>
</div>

3. HEADLINE BOX:
<div class="headline-box">
  <span class="pre-headline">[Warning or pattern interrupt — uppercase, typewriter style]</span>
  <h1>"[Main headline with <span class="red">key benefit highlighted in red</span>]"</h1>
  <p class="deck">[Subheadline — italic, indented with red left border]</p>
</div>

4. SALUTATION:
<div class="salutation">
  <p class="date-line">[Current date]</p>
  <p>Dear Fellow [Audience],</p>
</div>

5. BODY COPY (main persuasion):
<div class="body-copy">
  <p>[Opening hook — conversational, direct]</p>
  <p>[Problem identification — empathetic, specific]</p>
  
  <div class="pull-quote">
    "[Quotable insight or reframe]"
  </div>

  <p>[Continue building the case...]</p>

  <hr class="section-break">

  <h2>[Section headlines in uppercase red — Kennedy style]</h2>

  <p>[Use <strong>, <em>, <u>, <span class="red-text">, and <span class="caps"> for emphasis]</p>

  <div class="box red-border">
    <span class="box-headline">[Callout box title]</span>
    <p>[Important information in a bordered box]</p>
  </div>

  6. FASCINATION BULLETS (for features/benefits that create curiosity):
  <ul class="fascinations">
    <li><strong>[Bold lead]</strong> — [explanation that builds desire]</li>
  </ul>

  7. CHECKLIST (for what's included):
  <ul class="check-list">
    <li>[Item with clear benefit]</li>
  </ul>

  8. TESTIMONIALS:
  <div class="testimonial-block">
    <p class="quote-text">"[Detailed, specific testimonial quote]"</p>
    <p class="attribution"><strong>[Name]</strong> — [Title/Location]</p>
  </div>

  9. COMPARISON TABLE:
  <div class="box">
    <span class="box-headline">[Table title]</span>
    <table class="feature-table">
      <thead><tr><th>Feature</th><th>Without</th><th class="highlight-col">With [Product]</th></tr></thead>
      <tbody>
        <tr><td>[Feature]</td><td>[Cost]</td><td class="highlight-col"><span class="yes">✓ Included</span></td></tr>
      </tbody>
    </table>
  </div>

  10. WHO THIS IS FOR / NOT FOR:
  <div class="two-col">
    <div class="col-box green-top">
      <h4>This Is For You If:</h4>
      <ul><li>[Qualifier]</li></ul>
    </div>
    <div class="col-box red-top">
      <h4>Stop Reading If:</h4>
      <ul><li>[Disqualifier]</li></ul>
    </div>
  </div>

  11. BONUS STACK:
  <div class="bonus-row">
    <div class="bonus-num">[Number]</div>
    <div class="bonus-content">
      <strong>[Bonus name]</strong>
      <p>[Bonus description]</p>
    </div>
    <div class="bonus-value">Value: $[amount]</div>
  </div>

  12. ORDER BOX:
  <div class="order-box">
    <p class="product-label">[Product name — uppercase label]</p>
    <p class="was-price">Regular Price: $[higher price]</p>
    <p class="now-price">$[actual price]</p>
    <p class="price-context">[One-time payment. No monthly fees. Instant access.]</p>
    <a href="#" class="cta-btn">[CTA text]<br><span style="font-size: 12px;">[Sub-CTA text]</span></a>
    <p class="cta-sub-text">🔒 256-bit SSL encryption · Processed securely · Instant delivery</p>
  </div>

  13. GUARANTEE:
  <div class="guarantee-section">
    <div class="guarantee-seal">🛡️</div>
    <div class="guarantee-content">
      <h3>[Guarantee name]</h3>
      <p>[Guarantee details — generous, confident]</p>
    </div>
  </div>

  14. FAQ:
  <div class="faq-item">
    <h4>[Question in italic serif]</h4>
    <p>[Answer — direct, helpful]</p>
  </div>

  15. FINAL CLOSE + PS:
  <div class="pull-quote">[Final motivating statement]</div>

  <p class="signature">[Author name — large italic serif]</p>
  <p class="signature-name">[Title — uppercase monospace]</p>

  <div class="ps-section">
    <p><strong>P.S.</strong> — [Summary for skimmers with link to order]</p>
    <p><strong>P.P.S.</strong> — [Urgency/scarcity reason]</p>
  </div>

</div><!-- end body-copy -->

CRITICAL RULES FOR HTML OUTPUT:
- Use ONLY the class names shown above (urgency-bar, letter-header, from-desk, sender, headline-box, pre-headline, deck, salutation, date-line, body-copy, pull-quote, box, red-border, box-headline, fascinations, check-list, testimonial-block, quote-text, attribution, feature-table, highlight-col, yes, no, two-col, col-box, green-top, red-top, bonus-row, bonus-num, bonus-content, bonus-value, order-box, product-label, was-price, now-price, price-context, cta-btn, cta-sub-text, guarantee-section, guarantee-seal, guarantee-content, faq-item, ps-section, signature, signature-name, section-break, red-text, caps, divider)
- Write in a CONVERSATIONAL, DIRECT, PERSONAL tone — like a letter from a trusted advisor
- Use long-form body copy — paragraphs, not cards
- Keep paragraphs short (2-3 sentences max)
- Use <strong> for emphasis, <em> for italics, <u> for underlines with red color
- The output should read like a REAL direct-response sales letter, NOT a modern landing page
- Include at least one pull-quote, one testimonial block, one fascination list, one checklist, and the order box
- DO NOT include <!DOCTYPE>, <html>, <head>, or <body> tags — just the content starting from urgency-bar
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate authentication
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }
    console.log(`Authenticated user: ${user.id}`);

    const body = await req.json();
    
    // Validate core inputs
    const phase = typeof body.phase === 'string' && ['raw', 'polish', 'legacy'].includes(body.phase) ? body.phase : 'legacy';
    const title = typeof body.title === 'string' ? body.title.slice(0, 300) : '';
    const subtitle = typeof body.subtitle === 'string' ? body.subtitle.slice(0, 300) : '';
    const niche = typeof body.niche === 'string' ? body.niche.slice(0, 200) : '';
    const targetAudience = typeof body.targetAudience === 'string' ? body.targetAudience.slice(0, 500) : '';
    const components = typeof body.components === 'object' && body.components ? body.components : {};
    const price = typeof body.price === 'number' ? Math.min(Math.max(body.price, 0), 10000) : undefined;
    const authorName = typeof body.authorName === 'string' ? body.authorName.slice(0, 200) : '';
    const keyBenefits = Array.isArray(body.keyBenefits) ? body.keyBenefits.slice(0, 20) : undefined;
    const uniqueMechanism = typeof body.uniqueMechanism === 'string' ? body.uniqueMechanism.slice(0, 500) : '';
    const contentSummary = typeof body.contentSummary === 'object' ? body.contentSummary : undefined;
    const promptBoxData = typeof body.promptBoxData === 'object' ? body.promptBoxData : undefined;
    const rawDraft = typeof body.rawDraft === 'string' ? body.rawDraft.slice(0, 50000) : '';
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
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

    // PHASE 2: POLISH - Apply DigiStream Conversion Pattern with WarriorPlus HTML structure
    } else if (phase === "polish") {
      systemPrompt = `You are a world-class direct-response copywriter in the Dan Kennedy tradition.

You enhance structure and persuasion WITHOUT changing what the offer is.
You NEVER add fake testimonials, made-up statistics, or invented claims.
You work ONLY with the raw draft provided - do not re-interpret or change the core offer.
You output clean, structured HTML that matches the Kennedy direct-response letter aesthetic — cream background, serif fonts, red accents, personal letter tone.

TONE: Authoritative, conversational, direct — like a letter from a trusted advisor. Not salesy, not corporate.
STYLE: Long-form letter format with pull-quotes, fascination bullets, testimonial blocks, comparison tables, bonus stacks, and a clear order box.`;

      prompt = `Take this EXACT raw draft and restructure it as a Dan Kennedy-style direct-response sales letter.

=== RAW DRAFT (preserve the offer EXACTLY as described) ===
${rawDraft}

${DCP_FRAMEWORK}

${KENNEDY_HTML_STRUCTURE}

=== CRITICAL RULES ===
1. Keep the SAME offer, price, and components from the raw draft - DO NOT change them
2. DO NOT invent fake testimonials or statistics — generate placeholder testimonials clearly marked as examples
3. DO NOT use hype words like "breakthrough", "revolutionary", "secret", "amazing"
4. Write in FIRST PERSON — "I", "me", "my" — like a personal letter
5. Use the transformation language from the raw draft
6. Format using the EXACT HTML structure shown above with Kennedy classes
7. Include ALL required sections: urgency-bar, letter-header, headline-box, salutation, body-copy with pull-quotes, fascinations, check-lists, testimonial blocks, comparison table, who-this-is-for, bonus stack, order-box, guarantee, FAQ, PS section
8. Make it read like a REAL direct-response sales letter — conversational, persuasive, personal

=== ADDITIONAL CONTEXT ===
Product: ${title}
Niche: ${niche}
Target Audience: ${(promptBoxData as PromptBoxData)?.whoItsFor || targetAudience || "digital entrepreneurs"}
Price: $${price || 17}
Author: ${authorName || "The Creator"}

Remember: Conversion comes from Clarity → Belief → Momentum → Action. 
NOT from hype, pressure, or fake scarcity.

OUTPUT ONLY THE HTML CONTENT starting from the urgency-bar div. Do not include <!DOCTYPE>, <html>, <head>, or <body> tags — just the content that goes inside the page-wrapper.`;


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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${LOVABLE_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to your workspace." }), { 
          status: 402, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("AI generation failed");
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
      .replace(/â€"/g, "-")
      // Remove markdown code blocks if present
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "");

    return new Response(JSON.stringify({ salesLetter, phase }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate sales letter. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
