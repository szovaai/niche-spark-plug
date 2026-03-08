import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { SALES_PAGE_SYSTEM, OTO_UPSELL_SYSTEM } from "../_shared/copyPrompts.ts";

function sanitizeJsonStringContent(input: string): string {
  let result = "";
  let inString = false;
  let escape = false;

  for (const char of input) {
    if (escape) { result += char; escape = false; continue; }
    if (char === "\\") { result += char; escape = true; continue; }
    if (char === '"') { inString = !inString; result += char; continue; }
    if (inString) {
      if (char === "\n") { result += "\\n"; continue; }
      if (char === "\r") { result += "\\r"; continue; }
      if (char === "\t") { result += "\\t"; continue; }
    }
    result += char;
  }
  return result;
}

function findBalancedJsonEnd(input: string, startIndex: number): number {
  let braces = 0, brackets = 0, inString = false, escape = false;
  for (let i = startIndex; i < input.length; i++) {
    const char = input[i];
    if (escape) { escape = false; continue; }
    if (char === "\\") { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") braces++;
    else if (char === "}") braces--;
    else if (char === "[") brackets++;
    else if (char === "]") brackets--;
    if (braces === 0 && brackets === 0 && i > startIndex) return i;
  }
  return -1;
}

function extractAndRepairJson(content: string): unknown {
  let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const jsonStart = cleaned.search(/[\{\[]/);
  if (jsonStart === -1) throw new Error("No JSON found in response");
  const balancedEnd = findBalancedJsonEnd(cleaned, jsonStart);
  cleaned = balancedEnd === -1 ? cleaned.slice(jsonStart) : cleaned.slice(jsonStart, balancedEnd + 1);

  try { return JSON.parse(cleaned); } catch (_e1) {
    let repaired = sanitizeJsonStringContent(cleaned)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) repaired += '"';
    let braces = 0, brackets = 0, inString = false, escape = false;
    for (const char of repaired) {
      if (escape) { escape = false; continue; }
      if (char === "\\") { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (char === "{") braces++; else if (char === "}") braces--;
      if (char === "[") brackets++; else if (char === "]") brackets--;
    }
    while (brackets > 0) { repaired += "]"; brackets--; }
    while (braces > 0) { repaired += "}"; braces--; }
    try { return JSON.parse(repaired); } catch (_e2) {
      console.error("JSON repair failed, raw content (first 1200):", content.slice(0, 1200));
      return {
        salesPage: cleaned,
        optInPage: "Regenerate to get full structured version.",
        thankYouPage: "Thanks for your order! Check your email for access details.",
        bonusPage: "Bonus bundle details being prepared. Regenerate to populate.",
        checkoutCopy: "Complete your order now to lock in this price.",
        orderBump: "Add this quick-start upgrade to implement faster.",
        upsellOffer: "Upgrade now to unlock implementation templates.",
        offerStack: { coreProduct: { name: "Core Product", value: 97 }, bonuses: [], totalValue: 97, askingPrice: 17, stackCopy: "Core Product ($97 value) — Today only $17." },
        objections: []
      };
    }
  }
}

// --- STYLE-SPECIFIC SALES PAGE PROMPTS ---

function getStylePrompt(style: string, productBrief: any, chapterTitles: string, price: number, angleInstruction: string, mechanismInstruction: string, avatarContext: string, productContent: any): string {
  const commonContext = `
PRODUCT: ${productBrief.title} — ${productBrief.subtitle}
CONCEPT: ${productBrief.concept}
UNIQUE MECHANISM: ${productBrief.uniqueMechanism}
PAIN POINTS: ${productBrief.painPoints?.join(", ")}
CHAPTERS: ${chapterTitles}
DESCRIPTION: ${productContent?.description || ""}
FRONT-END PRICE: $${price}${angleInstruction}${mechanismInstruction}${avatarContext}`;

  const sectionsJson = `
  "salesPageSections": {
    "patternInterrupt": "A bold, pattern-interrupt headline — NOT a generic 'How To' title. Use a contrarian statement, a provocative question, or a specific result that stops the scroll. Example: 'Stop Chasing Clients. Make Them Ask YOU For Work Instead.' Max 2 lines.",
    "bigPromise": "The core promise in 2-3 sentences. Must contain: specific result + timeframe + qualifier ('even if you have no audience, no ads, no tech skills'). This is the subheadline beneath the pattern interrupt.",
    "curiosityHook": "A 'what if' curiosity hook that makes the reader lean in. Must reference the mechanism by name. 3-4 sentences that create an open loop.",
    "problemAgitation": "Short, sharp pain agitation. Use short paragraphs and em-dashes. List 3-4 specific frustrations the reader faces. End with a pivot: 'But what if there was a simpler way?'",
    "mechanismIntro": "Introduce the unique mechanism by name: '${productBrief.uniqueMechanism}'. Explain WHY it works differently in 3-4 sentences. This is not the product — it's the system/framework/method inside the product.",
    "systemSteps": ["Step 1 — [Action verb] + specific outcome", "Step 2 — ...", "Step 3 — ...", "Step 4 — ..."],
    "productBreakdown": [
      {"module": "Module 1", "title": "Module name", "description": "What they'll learn + specific outcome", "value": ${Math.round(price * 5)}},
      {"module": "Module 2", "title": "...", "description": "...", "value": ${Math.round(price * 5)}},
      {"module": "Module 3", "title": "...", "description": "...", "value": ${Math.round(price * 4)}},
      {"module": "Module 4", "title": "...", "description": "...", "value": ${Math.round(price * 4)}}
    ],
    "bonusStack": [
      {"name": "Bonus name with specific promise", "description": "What it is and specific result", "value": ${Math.round(price * 5)}},
      {"name": "...", "description": "...", "value": ${Math.round(price * 4)}},
      {"name": "...", "description": "...", "value": ${Math.round(price * 3)}}
    ],
    "socialProofBar": "Join [realistic 4-digit number]+ [target audience] who have already [specific result]. Use a credibility-building number that feels real, not round.",
    "buyerSignals": "Two sections: 'This Is For You If...' (4-5 bullet points matching the ideal buyer) and 'This Is NOT For You If...' (3-4 bullet points filtering out bad fits). This builds trust and increases conversions.",
    "implementationPath": "A '3-Day Quick Start' timeline: Day 1 — [specific first action + expected result]. Day 2 — [next step + milestone]. Day 3 — [launch action + outcome]. Make it feel achievable and exciting.",
    "testimonials": "3 realistic testimonial templates showing before state → product used → specific result → life now. Use first names and specific numbers.",
    "objectionHandling": "Address top 3 objections inline: price ('less than a single Uber Eats order'), skepticism ('here is exactly why this works differently'), time ('15 minutes a day is all you need').",
    "guarantee": "Named guarantee with bold framing. Example: 'The 30-Day Use-It-Or-Get-Your-Money-Back Guarantee'. 2-3 sentences explaining the risk reversal.",
    "urgencyClose": "Urgency without being fake. Use: launch pricing, rising price warning, or limited bonuses. 2-3 punchy sentences.",
    "callToAction": "Final CTA with specific action: 'Yes — Give Me Instant Access To ${productBrief.title} For Just $${price}'. Include what happens after clicking. One sentence of micro-copy beneath."
  }`;

  if (style === "warriorplus") {
    return `Generate a HIGH-CONVERTING WarriorPlus-style sales page AND full funnel copy.

The sales page MUST follow this structure:
1. Pattern interrupt headline (NOT generic)
2. Big promise with specifics
3. Curiosity hook that creates an open loop
4. Problem agitation (short, sharp, em-dashes)
5. Mechanism introduction by name
6. System steps (3-4 clear steps)
7. Product breakdown with perceived values per module
8. Bonus stack with individual values
9. Testimonial social proof
10. Objection handling woven in
11. Named guarantee
12. Urgency close
13. Specific CTA

CRITICAL STYLE RULES:
- Write like Gary Halbert having coffee with a friend — conversational but persuasive
- Every subhead must be bold and benefit-driven
- Use bullets, not paragraphs for benefits
- Price anchor against $${price * 20}+ alternatives BEFORE revealing $${price}
- The mechanism "${productBrief.uniqueMechanism}" must appear in headline, mechanism section, and CTA
- NO generic phrases like "game changer", "unlock your potential", "revolutionary"
${commonContext}

Return ONLY valid JSON:
{
  ${sectionsJson},
  "salesPage": "The COMPLETE sales page as one formatted document combining all sections above with markdown headers, bullets, and bold text. This is the full-page version for export.",
  "optInPage": "Opt-in page: pattern-interrupt headline, 3 curiosity-driven bullets, CTA: 'Yes — Send Me The Free [Lead Magnet Name]'.",
  "thankYouPage": "Thank you page: confirm purchase, specific FIRST action to take RIGHT NOW, surprise bonus reveal.",
  "bonusPage": "Bonus page showing all 3-5 bonuses with names, descriptions, and values.",
  "checkoutCopy": "Checkout: order summary with $${price} vs $${Math.round(price * 27)} total value, urgency element, trust text.",
  "orderBump": "Order bump ($${Math.min(price, 12)} add-on): name + 2-3 sentences + why they need it NOW.",
  "upsellOffer": "OTO at $${Math.round(price * 2.5)}: congratulations → the gap → includes → transformation → $${Math.round(price * 8)} vs $${Math.round(price * 2.5)} → CTA.",
  "offerStack": {
    "coreProduct": { "name": "${productBrief.title}", "value": ${Math.round(price * 15)} },
    "bonuses": [
      { "name": "Bonus Name", "description": "Specific result", "value": ${Math.round(price * 5)} },
      { "name": "Bonus Name", "description": "...", "value": ${Math.round(price * 4)} },
      { "name": "Bonus Name", "description": "...", "value": ${Math.round(price * 3)} }
    ],
    "totalValue": ${Math.round(price * 27)},
    "askingPrice": ${price},
    "stackCopy": "Value stack copy for sales page."
  },
  "objections": [
    {"objection": "Price concern phrased as buyer would say it", "reframe": "Specific reframe that turns it into a reason TO buy", "proof": "Evidence or logical argument", "followUpQuestion": "Question moving toward the sale"},
    {"objection": "Skepticism about results", "reframe": "...", "proof": "...", "followUpQuestion": "..."},
    {"objection": "I have tried before", "reframe": "...", "proof": "...", "followUpQuestion": "..."},
    {"objection": "Time concern", "reframe": "...", "proof": "...", "followUpQuestion": "..."},
    {"objection": "Delayed action / I will do it later", "reframe": "...", "proof": "...", "followUpQuestion": "..."}
  ]
}

CRITICAL:
- Output STRICT JSON ONLY (no markdown fences, no commentary)
- Escape all newlines as \\n and quotes inside strings
- salesPageSections is the STRUCTURED version; salesPage is the FULL DOCUMENT version
- Both must contain the same content, just formatted differently
- Keep total output focused so all keys complete in one response`;
  }

  if (style === "vsl") {
    return `Generate a VIDEO SALES LETTER SCRIPT and full funnel copy.
${commonContext}

The VSL script should be formatted with timing cues:
[0:00-0:15] HOOK — Pattern interrupt opening
[0:15-0:45] PROBLEM — Agitate the pain
[0:45-1:30] STORY — Your/their story
[1:30-2:30] MECHANISM — Introduce ${productBrief.uniqueMechanism}
[2:30-4:00] PROOF — Results and social proof
[4:00-5:00] OFFER — What they get
[5:00-5:30] CLOSE — CTA + urgency

Return ONLY valid JSON with these keys:
{
  ${sectionsJson},
  "salesPage": "The complete VSL script with timing cues formatted as a readable document.",
  "optInPage": "...", "thankYouPage": "...", "bonusPage": "...", "checkoutCopy": "...",
  "orderBump": "...", "upsellOffer": "...",
  "offerStack": { "coreProduct": { "name": "${productBrief.title}", "value": ${Math.round(price * 15)} }, "bonuses": [], "totalValue": ${Math.round(price * 27)}, "askingPrice": ${price}, "stackCopy": "..." },
  "objections": [{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."}]
}
CRITICAL: Output STRICT JSON ONLY. Escape newlines as \\n.`;
  }

  if (style === "short") {
    return `Generate a SHORT, high-impact landing page and full funnel copy. Hero + Mechanism + Stack + CTA only — no fluff.
${commonContext}

Return ONLY valid JSON:
{
  ${sectionsJson},
  "salesPage": "Short landing page: bold headline, 1-paragraph mechanism intro, bullet list of what is included, price anchor, CTA.",
  "optInPage": "...", "thankYouPage": "...", "bonusPage": "...", "checkoutCopy": "...",
  "orderBump": "...", "upsellOffer": "...",
  "offerStack": { "coreProduct": { "name": "${productBrief.title}", "value": ${Math.round(price * 15)} }, "bonuses": [], "totalValue": ${Math.round(price * 27)}, "askingPrice": ${price}, "stackCopy": "..." },
  "objections": [{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."}]
}
CRITICAL: Output STRICT JSON ONLY. Escape newlines as \\n.`;
  }

  // Default: longform (Dan Kennedy style)
  return `Generate a LONG-FORM Dan Kennedy style direct response sales letter AND full funnel copy.
${commonContext}

Structure: pre-headline → main headline (specific result + timeframe) → subheadline → dear friend opening → pain agitation → "what nobody tells you" → mechanism reveal ("${productBrief.uniqueMechanism}") → fascinations (curiosity-driven bullets) → what's included → named guarantee → price justification (anchor $${price * 20}+ before revealing $${price}) → urgency close → two kinds of people → FAQ → P.S. with deadline.

Return ONLY valid JSON:
{
  ${sectionsJson},
  "salesPage": "The COMPLETE long-form sales letter as one formatted document. 500-800 words minimum.",
  "optInPage": "...", "thankYouPage": "...", "bonusPage": "...", "checkoutCopy": "...",
  "orderBump": "...", "upsellOffer": "...",
  "offerStack": { "coreProduct": { "name": "${productBrief.title}", "value": ${Math.round(price * 15)} }, "bonuses": [{"name":"...","description":"...","value":${Math.round(price * 5)}},{"name":"...","description":"...","value":${Math.round(price * 4)}},{"name":"...","description":"...","value":${Math.round(price * 3)}}], "totalValue": ${Math.round(price * 27)}, "askingPrice": ${price}, "stackCopy": "..." },
  "objections": [{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."},{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."},{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."},{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."},{"objection":"...","reframe":"...","proof":"...","followUpQuestion":"..."}]
}
CRITICAL: Output STRICT JSON ONLY. Escape newlines as \\n. No markdown fences.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();

    // Handle optimization mode (backward compat)
    if (body.optimizationMode && body.existingSalesPage) {
      const userTier = await getUserTier(user.id);
      const optimizePrompt = `You are optimizing an existing sales page for higher conversions. 

EXISTING SALES PAGE:
${body.existingSalesPage.slice(0, 8000)}

MISSING CONVERSION ELEMENTS:
${body.missingElements}

INSTRUCTIONS:
- Keep ALL existing copy intact
- ADD the missing elements naturally into the sales page
- Maintain the same tone, voice, and style
- Return the COMPLETE sales page with additions woven in

Return ONLY valid JSON with the same structure as the original funnel:
{
  "salesPage": "The complete optimized sales page copy with missing elements added",
  "optInPage": "Keep existing or generate if missing",
  "thankYouPage": "Keep existing or generate if missing",
  "bonusPage": "Keep existing or generate if missing",
  "checkoutCopy": "Keep existing or generate if missing"
}`;

      const { content } = await callTieredAI([
        { role: "system", content: SALES_PAGE_SYSTEM },
        { role: "user", content: optimizePrompt },
      ], userTier, "standard");

      const result = extractAndRepairJson(content);
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { valid, error: valError, data } = validateInput(body, [
      { field: 'productBrief', type: 'object', required: true, maxLength: 10000 },
      { field: 'productContent', type: 'object', maxLength: 50000 },
      { field: 'price', type: 'number', maxLength: 100 },
      { field: 'buyerAvatar', type: 'object', maxLength: 10000 },
      { field: 'salesStyle', type: 'string', maxLength: 50 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productContent, buyerAvatar } = data;
    const price = data.price || 17;
    const salesStyle = data.salesStyle || "warriorplus";

    const cacheKey = `launch-funnel-${(productBrief as any).title?.slice(0, 50)}-${price}-${salesStyle}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const chapterTitles = productContent?.chapters?.map((c: any) => c.title).join(", ") || "N/A";
    const selectedAngle = productBrief.selectedAngle || "";
    const angleInstruction = selectedAngle ? `\nCAMPAIGN ANGLE: Use "${selectedAngle}" as the primary messaging theme across all copy.` : "";
    const avatarContext = buyerAvatar
      ? `\nBUYER AVATAR: ${(buyerAvatar as any).personaName} — ${(buyerAvatar as any).occupation}. Frustration: ${(buyerAvatar as any).dailyFrustration}. Fear: ${(buyerAvatar as any).biggestFear}. Dream: ${(buyerAvatar as any).secretDream}. Pain points: ${(buyerAvatar as any).painPoints?.join(", ")}. Language: ${(buyerAvatar as any).languageTheyUse?.join(", ")}`
      : '';
    const mechanismInstruction = productBrief.uniqueMechanism ? `\nUNIQUE MECHANISM: "${productBrief.uniqueMechanism}" — reference this named framework in headlines, benefits, and CTAs.` : "";

    const prompt = getStylePrompt(salesStyle, productBrief, chapterTitles, price, angleInstruction, mechanismInstruction, avatarContext, productContent);

    const { content, model } = await callTieredAI([
      { role: "system", content: SALES_PAGE_SYSTEM },
      { role: "user", content: prompt },
    ], userTier, "complex");

    const result = extractAndRepairJson(content) as any;
    
    // Inject the selected style into the result
    result.salesStyle = salesStyle;

    await setCachedResponse(cacheKey, "generate-launch-funnel", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate funnel. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
