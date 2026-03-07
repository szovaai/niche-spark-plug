import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

const ASSET_PROMPTS: Record<string, (ctx: any) => string> = {
  workbook: (ctx) => `Generate a comprehensive workbook for the digital product "${ctx.title}".
Product concept: ${ctx.concept}
Unique mechanism: ${ctx.mechanism}
Chapters: ${ctx.chapters.map((c: any, i: number) => `${i + 1}. ${c.title}`).join(", ")}

For EACH chapter, create a worksheet with:
- title (worksheet title matching the chapter)
- intro (1-2 sentences explaining the exercise)
- questions (array of 5-8 fill-in-the-blank or reflection questions)
- reflectionPrompt (a deeper thinking prompt)

Return ONLY valid JSON:
{
  "worksheets": [
    {
      "chapterIndex": 0,
      "title": "Worksheet: [Chapter Title]",
      "intro": "...",
      "questions": ["Question 1?", "Question 2?"],
      "reflectionPrompt": "..."
    }
  ]
}`,

  cheatsheet: (ctx) => `Generate 3-5 quick-reference cheat sheets for "${ctx.title}".
Product concept: ${ctx.concept}
Unique mechanism: ${ctx.mechanism}
Key topics: ${ctx.chapters.map((c: any) => c.title).join(", ")}

Each cheat sheet should be a concise, actionable one-pager with numbered steps.

Return ONLY valid JSON:
{
  "sheets": [
    {
      "title": "Quick [Topic] Cheat Sheet",
      "subtitle": "Your go-to reference for...",
      "steps": [
        { "number": 1, "title": "Step title", "description": "1-2 sentence action" }
      ],
      "proTip": "One powerful tip"
    }
  ]
}`,

  toolkit: (ctx) => `Generate a practical toolkit for "${ctx.title}".
Product concept: ${ctx.concept}
Target audience: ${ctx.audience}
Unique mechanism: ${ctx.mechanism}

Create 5-8 ready-to-use tools: scripts, outreach templates, checklists, swipe files.

Return ONLY valid JSON:
{
  "tools": [
    {
      "name": "Tool name",
      "type": "script|template|checklist|swipeFile",
      "description": "What this tool does",
      "content": "The actual usable content - full script, template with blanks, or checklist items"
    }
  ]
}`,

  templates: (ctx) => `Generate 5 reusable templates for "${ctx.title}".
Product concept: ${ctx.concept}
Target audience: ${ctx.audience}

Create professional, fill-in-the-blank templates: proposals, emails, onboarding forms, offer structures, etc.

Return ONLY valid JSON:
{
  "templates": [
    {
      "name": "Template name",
      "category": "email|proposal|onboarding|offer|outreach",
      "instructions": "How to use this template",
      "content": "The full template with [BRACKETS] for customizable fields"
    }
  ]
}`,

  promptPack: (ctx) => `Generate 15-20 AI prompts for "${ctx.title}".
Product concept: ${ctx.concept}
Target audience: ${ctx.audience}
Unique mechanism: ${ctx.mechanism}

Organize prompts by use case. Each prompt should be copy-paste ready for ChatGPT/Claude.

Return ONLY valid JSON:
{
  "categories": [
    {
      "name": "Category name",
      "prompts": [
        {
          "title": "Prompt title",
          "prompt": "The full prompt text with [VARIABLES] to customize",
          "expectedOutput": "What the user will get back"
        }
      ]
    }
  ]
}`,

  bonusGuides: (ctx) => `Generate 5 valuable bonus products for "${ctx.title}".
Product concept: ${ctx.concept}
Unique mechanism: ${ctx.mechanism}
Target audience: ${ctx.audience}

Each bonus should be a named product with perceived value of $47-$197.
Write 400-600 words of actual content for each.

Return ONLY valid JSON:
{
  "bonuses": [
    {
      "name": "Bonus product name",
      "perceivedValue": 97,
      "tagline": "One-line benefit statement",
      "content": "Full 400-600 word guide content"
    }
  ]
}`,

  caseStudies: (ctx) => `Generate 3 detailed fictional case studies for "${ctx.title}".
Product concept: ${ctx.concept}
Unique mechanism: ${ctx.mechanism}

Each case study should feel realistic with specific names, numbers, timeframes.

Return ONLY valid JSON:
{
  "caseStudies": [
    {
      "name": "Person's name",
      "background": "Brief background - who they are",
      "challenge": "What they were struggling with - specific details",
      "method": "How they used the ${ctx.mechanism} approach - step by step",
      "results": "Specific measurable results with numbers and timeframes",
      "quote": "A testimonial-style quote from this person"
    }
  ]
}`,

  multiplier: (ctx) => `Take the product "${ctx.title}" and show how it can be repurposed into 6 different formats.
Product concept: ${ctx.concept}
Current format: ${ctx.productType}

For each format, provide a brief pitch and 5-point outline.

Return ONLY valid JSON:
{
  "formats": [
    {
      "format": "Video Course",
      "pitch": "2-3 sentence pitch for this format",
      "outline": ["Module 1: ...", "Module 2: ..."],
      "estimatedPrice": 97,
      "timeToCreate": "2-3 weeks"
    }
  ]
}

Formats to cover: Video Course, Workshop/Webinar, Membership Site, Coaching Program, Done-For-You Service, Physical Book/Journal.`,
};

function extractAndRepairJson(raw: string): any {
  let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/gi, "").trim();
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Find first { or [
  const startObj = cleaned.indexOf("{");
  const startArr = cleaned.indexOf("[");
  let start = -1;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);

  if (start === -1) throw new Error("No JSON found");
  cleaned = cleaned.substring(start);

  // Fix trailing commas
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to auto-close
    let depth = 0;
    const stack: string[] = [];
    let inStr = false;
    let esc = false;
    for (const ch of cleaned) {
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
      if (ch === "}" || ch === "]") stack.pop();
    }
    if (inStr) cleaned += '"';
    while (stack.length) cleaned += stack.pop();
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || "Auth required", corsHeaders);

    const body = await req.json();
    const { assetType, productBrief, productContent, productType } = body;

    if (!assetType || !ASSET_PROMPTS[assetType]) {
      return new Response(JSON.stringify({ error: `Invalid asset type: ${assetType}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(user.id);

    const ctx = {
      title: productBrief?.title || "Digital Product",
      concept: productBrief?.concept || "",
      mechanism: productBrief?.uniqueMechanism || "",
      audience: productBrief?.painPoints?.join(", ") || "",
      chapters: productContent?.chapters || [],
      productType: productType || "ebook",
    };

    const prompt = ASSET_PROMPTS[assetType](ctx);

    const { content } = await callTieredAI(
      [
        { role: "system", content: MASTER_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      userTier,
      "standard"
    );

    const result = extractAndRepairJson(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Asset generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate asset. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
