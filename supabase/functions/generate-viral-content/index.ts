import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'mode', type: 'string', required: true, maxLength: 30 },
      { field: 'productBrief', type: 'object', required: true, maxLength: 10000 },
      { field: 'productContent', type: 'object', maxLength: 50000 },
      { field: 'funnelCopy', type: 'object', maxLength: 50000 },
      { field: 'platforms', type: 'object', maxLength: 500 },
      { field: 'viralText', type: 'string', maxLength: 5000 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { mode, productBrief, productContent, funnelCopy, platforms, viralText } = data;
    const userTier = await getUserTier(user.id);

    const productContext = `
PRODUCT: ${productBrief.title} — ${productBrief.subtitle || ""}
CONCEPT: ${productBrief.concept || ""}
UNIQUE MECHANISM: ${productBrief.uniqueMechanism || ""}
PAIN POINTS: ${productBrief.painPoints?.join(", ") || ""}
DESCRIPTION: ${productContent?.description || ""}`;

    let prompt = "";
    let systemPrompt = MASTER_SYSTEM_PROMPT || "You are an expert viral content strategist specializing in digital product marketing for WarriorPlus, JVZoo, and Gumroad launches.";

    if (mode === "generate-batch") {
      const selectedPlatforms = (platforms as string[]) || ["twitter", "facebook", "linkedin", "tiktok"];
      prompt = `Generate a complete viral social content batch for this digital product.
${productContext}

Return ONLY valid JSON with this exact structure:
{
  "curiosityPosts": [
    { "platform": "twitter|facebook|linkedin", "hook": "The opening hook line", "body": "Full post body", "cta": "Call to action", "charCount": 280, "viralPattern": "curiosity-gap" }
  ],
  "contrarianPosts": [
    { "platform": "...", "hook": "...", "body": "...", "cta": "...", "charCount": 280, "viralPattern": "contrarian" }
  ],
  "microStoryPosts": [
    { "platform": "...", "hook": "...", "body": "...", "cta": "...", "charCount": 280, "viralPattern": "micro-story" }
  ],
  "discoveryPosts": [
    { "platform": "...", "hook": "...", "body": "...", "cta": "...", "charCount": 280, "viralPattern": "discovery" }
  ],
  "listPosts": [
    { "platform": "...", "hook": "...", "body": "...", "cta": "...", "charCount": 280, "viralPattern": "list-style" }
  ],
  "threads": [
    { "platform": "twitter", "title": "Thread title", "tweets": ["Tweet 1 (hook)", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5 (CTA)"] }
  ],
  "tiktokScripts": [
    { "hookLine": "Opening line that stops scroll", "script": "[0:00-0:03] HOOK — ...\\n[0:03-0:15] PROBLEM — ...\\n[0:15-0:40] SOLUTION — ...\\n[0:40-0:55] PROOF — ...\\n[0:55-1:00] CTA — ...", "style": "raw|educational|story" }
  ],
  "engagementPosts": [
    { "platform": "...", "type": "question|poll|discussion", "body": "...", "expectedEngagement": "high|medium" }
  ]
}

RULES:
- Generate exactly 5 curiosity posts, 5 contrarian posts, 5 micro-story posts, 5 discovery posts, 5 list posts
- Generate exactly 3 viral threads (5-8 tweets each)
- Generate exactly 3 TikTok scripts under 60 seconds each
- Generate exactly 5 engagement posts (mix of questions, polls, discussions)
- Platforms to target: ${selectedPlatforms.join(", ")}
- Twitter posts: max 280 chars. LinkedIn: max 3000 chars. Facebook: max 500 chars.
- Every post MUST start with a scroll-stopping hook
- Use short paragraphs (1-2 sentences max)
- Include line breaks for readability
- NO hashtags in Twitter posts. Use 3-5 hashtags for LinkedIn and Instagram.
- CTA should be natural, not salesy
- Vary hook types: curiosity, confession, discovery, contrarian, data-driven
- Include specific numbers and results where relevant
- Avoid spam trigger phrases and unrealistic income claims
- Each post should feel like it was written by a real person, not AI`;

    } else if (mode === "generate-hooks") {
      prompt = `Generate 50 viral hooks for promoting this digital product on social media.
${productContext}

Return ONLY valid JSON:
{
  "hooks": [
    { "hook": "The hook text", "type": "curiosity|confession|discovery|contrarian|data|question|story|shock", "platform": "twitter|facebook|linkedin|tiktok|universal", "strength": "high|medium" }
  ]
}

RULES:
- Generate exactly 50 hooks
- Mix all 8 hook types evenly
- Each hook must be under 100 characters
- Hooks should be varied — no two should feel similar
- Include specific numbers and timeframes where relevant
- Avoid unrealistic claims
- Make them feel authentic and human`;

    } else if (mode === "analyze-viral") {
      if (!viralText) throw new Error("viralText required for analyze mode");
      prompt = `Analyze this viral post/thread and extract the patterns that made it go viral. Then generate 10 new posts using those same patterns for the product below.

VIRAL POST TO ANALYZE:
"""
${viralText}
"""

${productContext}

Return ONLY valid JSON:
{
  "analysis": {
    "hookPattern": "Description of the hook pattern used",
    "storyStructure": "Description of the narrative structure",
    "engagementTriggers": ["Trigger 1", "Trigger 2", "Trigger 3"],
    "toneStyle": "Description of the tone",
    "ctaStyle": "How the CTA was delivered",
    "viralScore": 85,
    "whyItWorked": "2-3 sentence explanation"
  },
  "generatedPosts": [
    { "body": "Full post using the extracted pattern", "platform": "twitter|facebook|linkedin", "patternUsed": "Which pattern from the analysis was applied" }
  ]
}

Generate exactly 10 new posts using the extracted patterns.`;

    } else {
      throw new Error("Invalid mode");
    }

    const { content, model } = await callTieredAI([
      { role: "system", content: systemPrompt + "\n\nYou are a viral content reverse-engineer. You study what makes posts go viral and replicate those patterns. Write in a raw, authentic, human voice. Short sentences. Line breaks between thoughts. Never sound like AI." },
      { role: "user", content: prompt },
    ], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    
    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch {
      const raw = jsonMatch[0];
      let depth = 0, lastValid = -1;
      for (let i = 0; i < raw.length; i++) {
        if (raw[i] === '{') depth++;
        else if (raw[i] === '}') { depth--; if (depth === 0) { lastValid = i; break; } }
      }
      if (lastValid > 0) result = JSON.parse(raw.slice(0, lastValid + 1));
      else throw new Error("Failed to parse");
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    const status = error instanceof Error && error.message === "Authentication required" ? 401 : 500;
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate viral content" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
