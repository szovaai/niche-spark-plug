import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

const DEPTH_CHAPTER_COUNTS: Record<string, { min: number; max: number; detail: string }> = {
  quick: { min: 4, max: 5, detail: "concise and fast-action. Each chapter should be short — 2-3 key points max, no fluff." },
  standard: { min: 6, max: 8, detail: "well-structured with examples and action steps per chapter." },
  premium: { min: 8, max: 10, detail: "comprehensive with expanded examples, worksheets, frameworks, and detailed walkthroughs per chapter. Each chapter should feel like a mini-course." },
  authority: { min: 12, max: 15, detail: "deeply comprehensive — each chapter must include case studies, scripts, templates, checklists, and multiple real-world examples. This is a definitive authority resource." },
};

function getExpansionPrompt(type: string, chapter: any, productBrief: any): string {
  const base = `Product: ${productBrief?.title || "Unknown"}\nChapter: "${chapter.title}"\nSummary: ${chapter.summary}`;

  switch (type) {
    case "caseStudy":
      return `${base}\n\nGenerate a detailed case study for this chapter. Return ONLY valid JSON:\n{\n  "expandedChapter": {\n    "caseStudies": [{\n      "name": "Case Study: How [Name] [Achieved Result]",\n      "problem": "Specific problem they faced with details",\n      "solution": "Exactly what they did step by step",\n      "result": "Specific measurable result with numbers and timeframe",\n      "quote": "A testimonial-style quote from the person"\n    }]\n  }\n}`;
    case "worksheet":
      return `${base}\n\nGenerate a practical worksheet for this chapter. Return ONLY valid JSON:\n{\n  "expandedChapter": {\n    "worksheets": [{\n      "title": "Worksheet: [Action-Oriented Title]",\n      "instructions": "Brief instructions on how to complete this worksheet",\n      "fields": ["Field 1: [Description]", "Field 2: [Description]", "Field 3: [Description]", "Field 4: [Description]", "Field 5: [Description]", "Field 6: [Description]"]\n    }]\n  }\n}`;
    case "template":
      return `${base}\n\nGenerate a ready-to-use template/script for this chapter. Return ONLY valid JSON:\n{\n  "expandedChapter": {\n    "templates": [{\n      "name": "Template: [Descriptive Name]",\n      "content": "The full template text with [PLACEHOLDER] fields that the reader fills in. Make it copy-paste ready."\n    }]\n  }\n}`;
    case "checklist":
      return `${base}\n\nGenerate an action checklist for this chapter. Return ONLY valid JSON:\n{\n  "expandedChapter": {\n    "checklists": [{\n      "title": "Checklist: [Action-Oriented Title]",\n      "items": ["Step 1: Specific action item", "Step 2: Specific action item", "Step 3: Specific action item", "Step 4: Specific action item", "Step 5: Specific action item", "Step 6: Specific action item", "Step 7: Specific action item"]\n    }]\n  }\n}`;
    case "realExample":
      return `${base}\n\nGenerate a detailed real-world example walkthrough for this chapter. Return ONLY valid JSON:\n{\n  "expandedChapter": {\n    "additionalExamples": [{\n      "title": "Example: [Specific Scenario Title]",\n      "steps": ["Step 1: Specific action with details", "Step 2: What to do next with specifics", "Step 3: The result you get", "Step 4: How to scale or improve", "Step 5: Expected outcome with numbers"]\n    }]\n  }\n}`;
    default:
      return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();

    // Handle full chapter content writing mode
    if (body.writeFullChapter) {
      const { chapterToExpand, productBrief: pb } = body;
      const userTier = await getUserTier(user.id);

      const writePrompt = `You are writing the FULL, COMPLETE content for one chapter of a digital product. This is NOT an outline — this is the actual readable chapter that a buyer will read.

PRODUCT: ${pb?.title || "Unknown"}
UNIQUE MECHANISM: ${pb?.uniqueMechanism || ""}
CHAPTER TITLE: "${chapterToExpand.title}"
CHAPTER SUMMARY: ${chapterToExpand.summary}
KEY POINTS TO COVER: ${chapterToExpand.keyPoints?.join(", ") || "none"}
${chapterToExpand.moduleGoal ? `MODULE GOAL: ${chapterToExpand.moduleGoal}` : ""}
${chapterToExpand.coreConcept ? `CORE CONCEPT: ${chapterToExpand.coreConcept}` : ""}

Write 1,500-2,500 words of ACTUAL CHAPTER CONTENT in markdown format. Structure it like a real book chapter:

1. OPENING HOOK (2-3 paragraphs)
   - Start with a relatable story, surprising fact, or provocative question
   - Pull the reader in emotionally — make them feel "this is about ME"
   - Transition into what this chapter will teach them

2. THE CORE TEACHING (main body — 800-1500 words)
   - Explain the concept clearly with analogies and real examples
   - Use specific names, numbers, timeframes, and dollar amounts — NOT generic statements
   - Break complex ideas into numbered steps or bullet points
   - Include "Here's exactly what to do" sections with copy-paste scripts/templates where relevant
   - Add "Pro Tip:" callouts for insider knowledge
   - Reference the ${pb?.uniqueMechanism || "core system"} naturally throughout

3. REAL-WORLD EXAMPLE (1-2 paragraphs)
   - A detailed scenario showing someone applying this chapter's teaching
   - Include specific numbers: "$347 in first 9 days", "landed 3 clients in 2 weeks"
   - Make it feel REAL — use a first name, describe their situation before and after

4. ACTION STEPS (3-5 concrete steps)
   - Each step should be completable in 10-15 minutes
   - Format: "Step 1: [Action] — [One sentence explaining how]"
   - These should be SPECIFIC, not vague ("Open ChatGPT and paste this prompt:" NOT "use AI to help you")

5. CHAPTER SUMMARY (2-3 bullet points)
   - "In this chapter, you learned..."
   - End with a transition to what comes next

WRITING RULES:
- Write in a warm, direct, conversational tone — like a mentor talking to a friend
- Short paragraphs (2-3 sentences max)
- Use "you" and "your" — speak directly to the reader
- NO corporate buzzwords: leverage, optimize, elevate, harness, dive into, journey
- Include specific examples with numbers, not generic advice
- Make every paragraph either teach something, show an example, or tell them what to do
- This should feel like premium content someone would pay $47+ for

Return the content as plain markdown text. Do NOT wrap in JSON. Just write the chapter.`;

      const { content } = await callTieredAI([
        { role: "system", content: MASTER_SYSTEM_PROMPT },
        { role: "user", content: writePrompt },
      ], userTier, "standard");

      return new Response(JSON.stringify({ fullContent: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Handle chapter expansion mode
    if (body.expandChapter) {
      const { chapterToExpand, chapterIndex, productBrief, expansionType } = body;
      const userTier = await getUserTier(user.id);

      let expandPrompt: string;

      if (expansionType && getExpansionPrompt(expansionType, chapterToExpand, productBrief)) {
        expandPrompt = getExpansionPrompt(expansionType, chapterToExpand, productBrief);
      } else {
        // Original full expansion
        expandPrompt = `You are expanding a chapter of a digital product to make it more specific, actionable, and example-rich.

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
      }

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
      { field: 'launchMode', type: 'string', maxLength: 20 },
      { field: 'contentDepth', type: 'string', maxLength: 20 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { productBrief, productType, buyerAvatar, launchMode, contentDepth } = data;
    const depth = contentDepth || "standard";
    const depthConfig = DEPTH_CHAPTER_COUNTS[depth] || DEPTH_CHAPTER_COUNTS.standard;

    const cacheKey = `launch-content-${depth}-${JSON.stringify(productBrief).slice(0, 100)}`;
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

CONTENT DEPTH: ${depth.toUpperCase()}
Generate ${depthConfig.min}-${depthConfig.max} chapters. Content should be ${depthConfig.detail}

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
- Generate ${depthConfig.min}-${depthConfig.max} chapters, each building on the previous one
- Every chapter MUST include moduleGoal, hook, coreConcept, actionPlan (3-5 steps), realExample, commonMistakes (2-3), actionStep, and moduleSummary (3 bullets)
- Each actionPlan step must have a specific, concrete action — not "learn about X" but "open [tool], click [button], paste [template]"
- Each realExample must include specific numbers, timeframes, or names — not "a student got results" but "Sarah K. used this template and generated $847 in her first 14 days"
- Bonuses must be named products with clear value
- Reference the unique mechanism "${productBrief.uniqueMechanism}" throughout
- Write in a warm, direct, conversational tone
- Generate exactly 5 testimonial templates
- Generate 5-7 before/after rows
- Quick wins must be SPECIFIC and TANGIBLE${launchMode === "warriorplus" ? `

WARRIORPLUS MODE — CRITICAL OVERRIDES:
- Each chapter must be SHORT and TACTICAL — more bullets, fewer paragraphs
- Cut all theory — every section must be "do this, then this, get this result"
- Chapter titles must be action-verb-first: "Deploy...", "Launch...", "Activate...", "Install..."
- Action steps must be completable in 10-15 minutes each — NO multi-day projects
- Real examples must include specific dollar amounts and timeframes under 30 days
- Bonuses must sound like standalone products: "The $97 [Name] — yours FREE"
- Description must open with a bold claim and close with urgency
- Tone: fast, bold, no-fluff — like a top seller's product, not a textbook` : ""}`;

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
