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
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'niche', type: 'string', required: true, maxLength: 200 },
      { field: 'targetAudience', type: 'string', maxLength: 500 },
      { field: 'productType', type: 'string', required: true, maxLength: 100 },
      { field: 'topic', type: 'string', required: true, maxLength: 500 },
      { field: 'lockedMechanism', type: 'string', maxLength: 500 },
      { field: 'buyerAvatar', type: 'object', maxLength: 10000 },
      { field: 'qualityMode', type: 'string', maxLength: 20 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, targetAudience, productType, topic, lockedMechanism, buyerAvatar, qualityMode } = data;

    const cacheKey = `launch-product-${niche}-${productType}-${topic}`;
    const cached = await getCachedResponse(cacheKey);
    if (cached) return new Response(JSON.stringify(cached), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userTier = await getUserTier(user.id);

    const mechanismInstruction = lockedMechanism
      ? `\n\nCRITICAL: The user has already approved this exact mechanism name from prior research: "${lockedMechanism}". You MUST use this EXACT name as the "uniqueMechanism" value. Do NOT rename, rephrase, or generate alternatives. The mechanisms array should still contain 8 options but the first one MUST use this exact name.`
      : '';

    const avatarContext = buyerAvatar
      ? `\n\nBUYER AVATAR — Write everything for this person:
Name: ${(buyerAvatar as any).personaName}
Occupation: ${(buyerAvatar as any).occupation}
Daily Frustration: ${(buyerAvatar as any).dailyFrustration}
What They've Tried: ${(buyerAvatar as any).triedBefore}
Secret Dream: ${(buyerAvatar as any).secretDream}
Biggest Fear: ${(buyerAvatar as any).biggestFear}
Words They Use: ${(buyerAvatar as any).languageTheyUse?.join(", ")}
Pain Points: ${(buyerAvatar as any).painPoints?.join(", ")}
Desires: ${(buyerAvatar as any).desires?.join(", ")}
Instant Buy Sentence: ${(buyerAvatar as any).instantBuySentence}`
      : '';

    const prompt = `Create a compelling product concept for a digital product launch.

Niche: ${niche}
Target Audience: ${targetAudience || "General audience"}
Product Type: ${productType}
Topic: ${topic}${avatarContext}

Return ONLY valid JSON:
{
  "title": "Catchy product title with a specific promise",
  "subtitle": "Compelling subtitle that disarms the biggest objection",
  "concept": "2-3 sentence product concept — lead with the pain it solves, then the specific outcome",
  "uniqueMechanism": "A named, proprietary-sounding framework (e.g. 'The 24-Hour Service Velocity Framework')",
  "painPoints": ["specific pain 1 with emotional detail", "pain 2", "pain 3", "pain 4", "pain 5"],
  "mechanisms": [
    { "name": "The [Number] [Result] Blueprint", "tagline": "Specific result + timeframe", "description": "2 sentences: how it works and why it's different", "formula": "Number", "whyItWorks": "Numbers create concreteness — the brain trusts specificity over vague promises" },
    { "name": "The [Timeframe] [Outcome] Formula", "tagline": "...", "description": "...", "formula": "Timeframe", "whyItWorks": "Time constraints create urgency and imply speed — the #1 buying trigger" },
    { "name": "[ACRONYM] Method", "tagline": "...", "description": "...", "formula": "Acronym", "whyItWorks": "Acronyms feel teachable and proprietary — like you invented something real" },
    { "name": "The [Analogy] Method", "tagline": "...", "description": "...", "formula": "Metaphor", "whyItWorks": "Metaphors make complex ideas feel simple and familiar" },
    { "name": "The [Niche Expert]'s [Secret/Code/Protocol]", "tagline": "...", "description": "...", "formula": "Insider", "whyItWorks": "Insider language creates exclusivity — people want what others don't have" },
    { "name": "From [Pain State] to [Dream State] System", "tagline": "...", "description": "...", "formula": "Transformation", "whyItWorks": "Before/after framing activates the brain's desire for change" },
    { "name": "The [Counterintuitive Statement] Protocol", "tagline": "...", "description": "...", "formula": "Contrarian", "whyItWorks": "Challenging beliefs creates curiosity — they HAVE to find out why" },
    { "name": "The Simple [Result] System", "tagline": "...", "description": "...", "formula": "Simple", "whyItWorks": "Simplicity sells — overwhelmed buyers want the easiest path possible" }
  ],
  "campaignAngles": [
    { "name": "Speed", "hook": "A scroll-stopping hook with a specific timeframe or number", "description": "2 sentences on why this angle resonates" },
    { "name": "Simplicity", "hook": "A scroll-stopping hook emphasizing ease", "description": "..." },
    { "name": "Results", "hook": "A scroll-stopping hook leading with a specific outcome", "description": "..." }
  ]
}

CRITICAL RULES:
- Generate EXACTLY 8 mechanisms, one per formula type (Number, Timeframe, Acronym, Metaphor, Insider, Transformation, Contrarian, Simple)
- Every mechanism name must sound proprietary and branded
- Each "whyItWorks" must explain the psychological principle behind that naming formula (1 sentence)
- Every hook must contain a number, timeframe, or specific result — NEVER vague promises
- Pain points must be emotionally specific — describe the exact frustration, not a generic problem
- Campaign angles should trigger completely different emotions${mechanismInstruction}${qualityMode === "premium" ? `

PREMIUM QUALITY INSTRUCTIONS:
- Include a real-world statistic or data point in the concept (e.g., "73% of freelancers report...")
- Each pain point must include an emotional detail AND a specific scenario
- Each mechanism description must include a mini case study: "[Name] used this to [specific result] in [timeframe]"
- Campaign angle hooks must be scroll-stopping — use numbers, timeframes, or provocative statements
- Add a "Pro Tip" element to each mechanism's whyItWorks explaining how to position it` : ""}`;


    const { content, model } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    await setCachedResponse(cacheKey, "generate-launch-product", cacheKey, result, userTier, model);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate product. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
