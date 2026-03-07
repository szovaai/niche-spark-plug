import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { getCachedResponse, setCachedResponse } from "../_shared/cache.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { EMAIL_SEQUENCE_SYSTEM } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) {
      return unauthorizedResponse(authError || 'Authentication required', corsHeaders);
    }

    const {
      offerName, targetAudience, keyBenefits, uniqueMechanism,
      price, salesPageUrl, contentSummary
    } = await req.json();

    console.log("Generating 5-email launch sequence for:", offerName);

    const userTier = await getUserTier(user.id);
    const actualPrice = price || 17;

    let prompt = "";

    if (contentSummary) {
      const summary = contentSummary;
      prompt = `Generate a 5-email post-purchase launch sequence for "${offerName}" at $${actualPrice} targeting ${targetAudience}.

=== PRODUCT CONTENT ===
MAIN TRANSFORMATION: ${summary.mainTransformation}
CHAPTER THEMES: ${summary.chapterThemes?.map((c: any) => `${c.chapter}: ${c.keyTakeaway}`).join("; ") || "Complete guide"}
UNIQUE MECHANISM: ${summary.uniqueMechanisms?.map((m: any) => `"${m}"`).join(", ") || uniqueMechanism || offerName}
KEY BENEFITS: ${summary.specificBenefits?.join("; ") || keyBenefits?.join("; ") || ""}
PAIN POINTS: ${summary.painPointsAddressed?.join("; ") || ""}

=== EMAIL SEQUENCE ===
Email 1 (Immediately after purchase): Welcome + Quick Win
- Subject: curiosity or specific result within 24 hours
- Body: Welcome, remind them of the transformation, give ONE action to take RIGHT NOW
- No backstory — get them moving

Email 2 (Day 2): The Story
- Subject: pattern interrupt — unexpected or counterintuitive
- Body: Specific story of someone like them who got results. Same fears, same past failures.

Email 3 (Day 3): The Mistake
- Subject: warn about a specific mistake
- Body: #1 mistake people make + how to avoid it using what they learned

Email 4 (Day 5): Social Proof + Upsell
- Subject: curiosity-driven, hint at a result
- Body: Reinforce value, introduce upgrade as natural next step, specific benefit of upgrading

Email 5 (Day 7): Last Chance or Next Steps
- Subject: urgency or forward momentum
- Body: Urgency close on time-limited bonus, OR pivot to next action

Return JSON:
{
  "sequenceTheme": "2-3 word theme",
  "narrativeArc": "One sentence story arc",
  "emails": [
    {
      "day": 1,
      "focus": "welcome-quick-win",
      "subject": "Under 50 chars — hook",
      "previewText": "Under 50 chars",
      "openingHook": "2-3 sentence hook — question, bold claim, or story fragment",
      "storyAnalogy": "Main body (3-4 paragraphs, max 250 words total)",
      "lessonTwist": "The lesson connecting to the product",
      "offerBridge": "Bridge to next email or action",
      "cta": "One specific CTA with link placeholder",
      "ps": "P.S. line with extra hook"
    }
  ]
}

RULES:
- Reference ACTUAL chapter themes and mechanisms — not generic benefits
- Every subject line under 50 chars
- Every email under 300 words
- ONE CTA per email — never more than one link
- Open every email with a hook — never a corporate greeting`;
    } else {
      prompt = `Generate a 5-email sequence for "${offerName}" targeting ${targetAudience}. Benefits: ${keyBenefits?.join(", ") || "proven results"}. Mechanism: ${uniqueMechanism || "A proven system"}. Price: $${actualPrice}.

Follow the 5-email structure: Welcome+QuickWin, Story, Mistake, SocialProof+Upsell, LastChance.

Return JSON: {"sequenceTheme": "", "narrativeArc": "", "emails": [{"day": 1, "focus": "", "subject": "", "previewText": "", "openingHook": "", "storyAnalogy": "", "lessonTwist": "", "offerBridge": "", "cta": "", "ps": ""}]}

Rules: subject under 50 chars, body under 300 words, ONE CTA per email, open with a hook.`;
    }

    const { content, model } = await callTieredAI([
      { role: "system", content: EMAIL_SEQUENCE_SYSTEM },
      { role: "user", content: prompt },
    ], userTier, "complex");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse response");

    const emailSequence = JSON.parse(jsonMatch[0]);
    emailSequence.offerName = offerName;
    emailSequence.targetAudience = targetAudience;
    emailSequence.price = actualPrice;

    return new Response(JSON.stringify(emailSequence), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate email sequence. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
