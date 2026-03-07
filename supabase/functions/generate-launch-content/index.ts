import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();

    // Handle chapter expansion mode
    if (body.expandChapter) {
      const { chapterToExpand, chapterIndex, productBrief } = body;
      const userTier = await getUserTier(user.id);

      const expandPrompt = `You are expanding a chapter of a digital product to make it more specific, actionable, and example-rich.

Original Chapter: "${chapterToExpand.title}"
Summary: ${chapterToExpand.summary}
Key Points: ${chapterToExpand.keyPoints?.join(", ") || "none"}
Product: ${productBrief?.title || "Unknown"}
Unique Mechanism: ${productBrief?.uniqueMechanism || ""}

EXPAND this chapter by adding:
1. A real-world example with specific details (names, numbers, timeframes)
2. Step-by-step implementation walkthrough (3-5 concrete steps)
3. A troubleshooting section ("If X happens, do Y") with 2-3 scenarios
4. Common mistakes to avoid (2-3)
5. An immediate action step the reader can do in the next 10 minutes

Return ONLY valid JSON:
{
  "expandedChapter": {
    "title": "Keep original or improve with specific outcome",
    "summary": "Enhanced 2-3 paragraph summary with specific details",
    "keyPoints": ["specific point 1", "specific point 2", "specific point 3"],
    "moduleGoal": "One sentence: what the reader will be able to DO after this chapter",
    "hook": "2-3 paragraph opening that grabs attention with a relatable scenario",
    "coreConcept": "The core idea explained simply with an analogy",
    "actionPlan": [
      { "step": "Step 1", "action": "Specific action to take", "why": "Why this matters" },
      { "step": "Step 2", "action": "Specific action to take", "why": "Why this matters" },
      { "step": "Step 3", "action": "Specific action to take", "why": "Why this matters" }
    ],
    "realExample": "A detailed real-world example with specific numbers, names, and outcomes",
    "commonMistakes": ["Mistake 1 with explanation", "Mistake 2 with explanation"],
    "actionStep": "One specific thing they can do RIGHT NOW in the next 10 minutes",
    "moduleSummary": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"]
  }
}`;

      const { content } = await callTieredAI([
        { role: "system", content: MASTER_SYSTEM_PROMPT },
        { role: "user", content: expandPrompt },
      ], userTier, "standard");

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse AI response");
      const result = JSON.parse(jsonMatch[0]);

      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Normal generation mode
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'productBrief', type: 'object', required: true, maxLength: 10000 },
      { field: 'productType', type: 'string', maxLength: 100 },
      { field: 'buyerAvatar', type: 'object', maxLength: 10000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productType, buyerAvatar } = data;

    const cacheKey = `launch-content-${JSON.stringify(productBrief).slice(0, 100)}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const avatarContext = buyerAvatar
      ? `\nBUYER AVATAR — Write for this specific person:\nName: ${(buyerAvatar as any).personaName}\nFrustration: ${(buyerAvatar as any).dailyFrustration}\nDesires: ${(buyerAvatar as any).desires?.join(", ")}\nPain Points: ${(buyerAvatar as any).painPoints?.join(", ")}\nLanguage: ${(buyerAvatar as any).languageTheyUse?.join(", ")}`
      : '';

    const prompt = `Generate a complete product outline AND a proof/credibility stack for a digital product.${avatarContext}

Product: ${productBrief.title}
Subtitle: ${productBrief.subtitle}
Concept: ${productBrief.concept}
Type: ${productType || "ebook"}
Unique Mechanism: ${productBrief.uniqueMechanism}
Pain Points: ${productBrief.painPoints?.join(", ") || ""}

Return ONLY valid JSON:
{
  "outline": "2-3 paragraph overview — open with the reader's problem, introduce the mechanism, then outline the transformation path. Write conversationally.",
  "chapters": [
    {
      "title": "Action-oriented chapter title with specific outcome",
      "summary": "2-3 sentences: what they'll learn and the result they'll get",
      "keyPoints": ["specific actionable point 1", "point 2", "point 3"],
      "moduleGoal": "One sentence: what the reader will be able to DO after this chapter",
      "hook": "2-3 paragraph opening that grabs attention with a relatable scenario or surprising fact",
      "coreConcept": "The core idea explained simply — use an analogy if possible",
      "actionPlan": [
        { "step": "Step 1", "action": "Specific concrete action", "why": "Why this matters for results" },
        { "step": "Step 2", "action": "Specific concrete action", "why": "Why this matters for results" },
        { "step": "Step 3", "action": "Specific concrete action", "why": "Why this matters for results" }
      ],
      "realExample": "A detailed real-world example with specific numbers, names, and outcomes — not generic",
      "commonMistakes": ["Common mistake 1 with why it fails", "Common mistake 2 with why it fails"],
      "actionStep": "One specific thing they can do RIGHT NOW in the next 10 minutes",
      "moduleSummary": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"]
    }
  ],
  "bonuses": ["Bonus 1: [Name] — specific description of what it is and the result it produces", "Bonus 2: ...", "Bonus 3: ..."],
  "description": "A compelling 150-word product description — lead with pain, introduce mechanism, promise specific result.",
  "proofStack": {
    "testimonialTemplates": [
      {
        "name": "[TESTIMONIAL 1]",
        "before": "What life/work was like BEFORE — specific frustration",
        "product": "What they did with the product — specific action",
        "result": "Specific measurable result — numbers, timeframes",
        "lifeNow": "How their situation is different now"
      }
    ],
    "beforeAfterTable": [
      { "before": "Specific pain state in buyer's own words", "after": "Specific transformed state with measurable difference" }
    ],
    "credibilityBuilder": "2-3 paragraphs of honest credibility copy for someone who may not have testimonials yet.",
    "earningsDisclaimer": "FTC-compliant earnings/results disclaimer customized to this product type.",
    "quickWinsList": [
      "Specific tangible outcome #1",
      "Specific tangible outcome #2",
      "Specific tangible outcome #3",
      "Specific tangible outcome #4",
      "Specific tangible outcome #5"
    ]
  }
}

RULES:
- Generate 6-8 chapters, each building on the previous one
- Every chapter MUST include moduleGoal, hook, coreConcept, actionPlan (3-5 steps), realExample, commonMistakes (2-3), actionStep, and moduleSummary (3 bullets)
- Each actionPlan step must have a specific, concrete action — not "learn about X" but "open [tool], click [button], paste [template]"
- Each realExample must include specific numbers, timeframes, or names — not "a student got results" but "Sarah K. used this template and generated $847 in her first 14 days"
- Bonuses must be named products with clear value
- Reference the unique mechanism "${productBrief.uniqueMechanism}" throughout
- Write in a warm, direct, conversational tone
- Generate exactly 5 testimonial templates
- Generate 5-7 before/after rows
- Quick wins must be SPECIFIC and TANGIBLE`;

    const { content, model } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-content", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate content. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
