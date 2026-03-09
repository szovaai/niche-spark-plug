import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const { chapter, productTitle, uniqueMechanism } = await req.json();
    const userTier = await getUserTier(user.id);

    const chapterText = [
      chapter.title, chapter.summary,
      ...(chapter.keyPoints || []),
      chapter.hook || "", chapter.coreConcept || "",
      chapter.realExample || "", chapter.actionStep || "",
      ...(chapter.commonMistakes || []),
      ...(chapter.moduleSummary || []),
      ...(chapter.actionPlan?.map((a: any) => `${a.step} ${a.action} ${a.why}`) || []),
    ].join("\n\n");

    const prompt = `You are a direct-response copy editor. Rewrite this chapter content to be more HUMAN, CONVERSATIONAL, and ACTIONABLE.

PRODUCT: ${productTitle || "Unknown"}
UNIQUE MECHANISM: ${uniqueMechanism || ""}

ORIGINAL CONTENT:
${chapterText}

REWRITE RULES:
1. SHORT SENTENCES. 2-3 sentences per paragraph max.
2. Use contractions (you'll, don't, can't, here's, that's).
3. Write like a mentor talking to a friend — warm, direct, energetic.
4. REMOVE all corporate/AI phrases: "leverage", "optimize", "elevate", "in today's digital landscape", "it is important to note", "furthermore", "moreover", "comprehensive guide", "harness the power", "unlock your potential", "game changer", "without further ado", "dive into", "journey".
5. REPLACE vague advice with specific instructions: NOT "do outreach" → "Open Instagram, search #[niche]smallbusiness, DM 10 accounts with this script: [script]"
6. ADD "here's what to do now" after every concept.
7. ADD specific examples with names, numbers, and timeframes.
8. Make every paragraph either TEACH something, SHOW an example, or TELL them what to do.
9. Add momentum phrases: "Here's the cool part", "This is where it gets good", "Quick win incoming"
10. Remove repeated ideas and bloated intros.

Return ONLY valid JSON matching the original chapter structure:
{
  "title": "Same or punchier title",
  "summary": "2-3 sentence rewritten summary",
  "keyPoints": ["specific rewritten point 1", "point 2", "point 3"],
  "moduleGoal": "Rewritten goal focused on what they'll DO",
  "hook": "Rewritten conversational hook (2-3 short paragraphs)",
  "coreConcept": "Rewritten with analogy and simple language",
  "actionPlan": [
    { "step": "Step 1", "action": "Ultra-specific action", "why": "Why in plain language" }
  ],
  "realExample": "Rewritten with specific name, dollar amount, and timeframe",
  "commonMistakes": ["Rewritten mistake 1", "Rewritten mistake 2"],
  "actionStep": "One specific thing they can do RIGHT NOW",
  "moduleSummary": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"]
}`;

    const { content } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to humanize content." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
