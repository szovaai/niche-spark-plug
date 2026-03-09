import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { MASTER_SYSTEM_PROMPT } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { productName, mechanism, targetAudience, painPoints, price, mode, copyText } = body;

    if (!productName) {
      return new Response(JSON.stringify({ error: "Product name required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userTier = await getUserTier(user.id);

    if (mode === "believability-check") {
      // --- Believability Filter ---
      const checkPrompt = `You are a direct-response copy editor specializing in the MMO/WarriorPlus niche.

Review this sales copy and flag any claims that could hurt credibility or increase refund risk.

COPY TO REVIEW:
${copyText?.slice(0, 6000) || "No copy provided"}

For each issue found, provide:
1. The problematic claim (exact quote)
2. Why it's risky (legal, believability, or refund risk)
3. A rewritten version that's compelling but credible

Return JSON:
{
  "overallScore": 0-100,
  "verdict": "Safe|Needs Work|Risky",
  "issues": [
    {
      "original": "exact quote from copy",
      "risk": "Why this is problematic",
      "rewrite": "Better version",
      "severity": "high|medium|low"
    }
  ],
  "strengths": ["What's already good about this copy"]
}`;

      const { content } = await callTieredAI([
        { role: "system", content: "You are a compliance-aware copy editor. Flag unrealistic claims but keep copy persuasive." },
        { role: "user", content: checkPrompt },
      ], userTier, "standard");

      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse");
      return new Response(match[0], { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Sales Hook Generator (100 headlines) ---
    console.log("Generating 100 headline hooks for:", productName);

    const prompt = `Generate exactly 100 unique sales headline variations for a digital product.

PRODUCT: ${productName}
MECHANISM: ${mechanism || productName}
AUDIENCE: ${targetAudience || "online entrepreneurs"}
PAIN POINTS: ${painPoints?.join(", ") || "struggling to start, overwhelmed by options"}
PRICE: $${price || 17}

Generate 100 headlines across these 10 categories (10 each):

CATEGORY 1 — CURIOSITY HOOKS
Headlines that create an open loop. The reader MUST click to find out.
Pattern: "The strange [thing] that [unexpected result]..."
Example: "The weird 3-step trick that turns ChatGPT into a client-getting machine"

CATEGORY 2 — CONTRARIAN HOOKS
Challenge conventional wisdom. Say the opposite of what everyone says.
Pattern: "Why [common advice] is actually killing your [goal]"
Example: "Why building a funnel FIRST is the worst thing a beginner can do"

CATEGORY 3 — BIG PROMISE HOOKS
Lead with a specific, measurable result.
Pattern: "[Specific result] in [timeframe] — even if [objection]"
Example: "Your first $500 client in 7 days — even if you've never sold anything online"

CATEGORY 4 — QUESTION HOOKS
Ask a question that forces the reader to say "yes" or "that's me."
Pattern: "Are you still [common mistake] when you could [better outcome]?"
Example: "Are you still writing ebooks manually when AI can do it in 30 minutes?"

CATEGORY 5 — STORY HOOKS
Open with a story fragment that demands completion.
Pattern: "I [action] and [unexpected thing happened]..."
Example: "I sent 20 messages to local businesses and woke up to 3 replies asking for my rates"

CATEGORY 6 — PROOF HOOKS
Lead with results, numbers, or evidence.
Pattern: "[Number/result] using nothing but [simple method]"
Example: "$1,247 in 14 days using nothing but free AI tools and a Google Doc"

CATEGORY 7 — SPEED HOOKS
Emphasize how fast they can get results.
Pattern: "From [bad state] to [good state] in [fast timeframe]"
Example: "From zero to your first digital product in under 60 minutes"

CATEGORY 8 — FEAR/LOSS HOOKS
What they'll miss or lose by NOT acting.
Pattern: "The [cost] of waiting another [timeframe] to [start]"
Example: "Every day you don't have an offer ready is a day someone else takes your clients"

CATEGORY 9 — IDENTITY HOOKS
Speak to WHO they want to become.
Pattern: "Become the [identity] who [does thing] without [pain]"
Example: "Become the person who generates income from simple AI products — on your own schedule"

CATEGORY 10 — MECHANISM HOOKS
Name-drop the proprietary system.
Pattern: "How the [mechanism name] turns [input] into [output]"
Example: "How the Outcome Acceleration Engine turns one idea into a complete product launch"

Return JSON:
{
  "headlines": {
    "curiosity": ["10 headlines"],
    "contrarian": ["10 headlines"],
    "bigPromise": ["10 headlines"],
    "question": ["10 headlines"],
    "story": ["10 headlines"],
    "proof": ["10 headlines"],
    "speed": ["10 headlines"],
    "fearLoss": ["10 headlines"],
    "identity": ["10 headlines"],
    "mechanism": ["10 headlines"]
  }
}

RULES:
- Every headline under 80 characters
- Use specific numbers, timeframes, and results — never vague
- Reference the mechanism "${mechanism || productName}" in at least 20 headlines
- No banned phrases: "game changer", "revolutionary", "unlock your potential", "journey"
- Sound human. No corporate speak.`;

    const { content } = await callTieredAI([
      { role: "system", content: MASTER_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ], userTier, "complex");

    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse headlines");
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
