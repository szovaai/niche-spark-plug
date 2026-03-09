import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
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
      price, contentSummary,
      framework = "momentum-launch",
      purpose = "product-launch",
      emailCount = 5,
      mineStoriesOnly = false,
    } = await req.json();

    const userTier = await getUserTier(user.id);
    const actualPrice = price || 17;

    // --- Story Mining Mode ---
    if (mineStoriesOnly) {
      console.log("Mining story angles for:", offerName);
      const storyPrompt = `Generate exactly 50 unique email story angles for a digital product called "${offerName}" targeting ${targetAudience || "online entrepreneurs"}.

Each angle should be a one-sentence email story idea a creator could use.

Categories to pull from:
- personal experience / mistake
- client or customer story
- discovery moment
- funny observation
- contrarian take
- failure lesson
- "aha" realization
- industry myth busted
- tool or hack discovery

Return JSON: {"storyAngles": ["angle 1", "angle 2", ...]}

Rules:
- Every angle must be specific and vivid, not generic
- Mix curiosity, humor, confession, and discovery tones
- Each angle should naturally lead to a product mention`;

      const { content } = await callTieredAI([
        { role: "system", content: "You generate vivid, specific email story angles for digital product creators. No corporate tone. Sound human." },
        { role: "user", content: storyPrompt },
      ], userTier, "complex");

      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse story angles");
      const parsed = JSON.parse(match[0]);
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Framework Prompts ---
    console.log(`Generating ${emailCount}-email ${framework} sequence for:`, offerName);

    const purposeContext: Record<string, string> = {
      "product-launch": "pre-launch and launch day conversion",
      "nurture-list": "daily relationship building with subtle product mentions",
      "affiliate-promo": "affiliate product promotion with honest reviews",
      "webinar-promo": "webinar registration and attendance",
      "daily-content": "daily value emails with occasional soft promotion",
    };

    const frameworkInstructions: Record<string, string> = {
      "daily-curiosity": `DAILY CURIOSITY SEQUENCE (story-driven, subtle selling)

Each email follows this structure:
1. HOOK — Open with a small personal moment, observation, or curiosity trigger. Not a greeting.
2. STORY MOMENT — Tell a short relatable story (mistake, funny moment, realization, client story, something you saw).
3. INSIGHT — Connect the story to a lesson the reader cares about.
4. SOFT BRIDGE — Transition naturally to the product. No hard sell.
5. CALL TO ACTION — One soft CTA. "Take a look here." / "See what I mean?" / "Check this out."
6. P.S. — Extra hook or curiosity teaser.

TONE RULES:
- Conversational. Like texting a smart friend.
- Short paragraphs (1-3 sentences max).
- Use contractions. Use em-dashes.
- Mix hook styles: curiosity, confession, discovery, story, contrarian, observation.
- NEVER start with "I hope this finds you well" or any corporate opener.
- Selling should feel accidental — like the product just happens to solve what you're talking about.

Rotate these hook styles across emails:
- Curiosity: "Something weird happened when I tested this…"
- Confession: "I made a huge mistake when I first tried this."
- Discovery: "I just realized why most people fail at this."
- Story: "This reminds me of something that happened years ago…"
- Contrarian: "Everyone says you need funnels… but that's not true."
- Observation: "I noticed something strange about every successful launch…"`,

      "momentum-launch": `MOMENTUM LAUNCH SEQUENCE (narrative arc, builds anticipation)

The sequence follows a dramatic arc:

Email 1 — THE SETUP: Introduce the story. Hook attention with an unexpected opening. "I almost didn't release this…"
Email 2 — THE CONFLICT: Explain the problem or struggle. Make it feel personal. "Every product generator I tested produced garbage."
Email 3 — THE DISCOVERY: Reveal the breakthrough moment. "That's when I realized the real problem wasn't the AI… it was the prompts."
Email 4 — THE SOLUTION: Introduce the system naturally. "So I built a system that forces AI to produce outcome-driven products."
Email 5 — THE OFFER: Present the product with full value stack. Urgency close.

For sequences longer than 5 emails, add these between Discovery and Offer:
- Proof emails (case studies, scenarios, results)
- Objection-killing emails (time, money, fit)
- Value bomb emails (teach a micro-lesson)
- Urgency emails (deadline, expiring bonus)

Each email structure:
1. HOOK — Bold statement, question, or story fragment. Never a greeting.
2. STORY/BODY — 3-4 short paragraphs building momentum. Max 250 words.
3. LESSON/TWIST — The insight that makes them lean in.
4. BRIDGE — Natural transition to what's coming next (or the offer).
5. CTA — ONE specific call to action.
6. P.S. — Tease the next email or add urgency.

TONE: Urgent but not pushy. Confident. Story-driven. Each email must make them want to open the next one.`,
    };

    const prompt = `Generate a ${emailCount}-email ${framework === "daily-curiosity" ? "Daily Curiosity" : "Momentum Launch"} sequence for "${offerName}" at $${actualPrice}.

TARGET: ${targetAudience || "Online entrepreneurs"}
BENEFITS: ${keyBenefits?.join("; ") || "proven results, fast implementation"}
MECHANISM: ${uniqueMechanism || offerName}
PURPOSE: ${purposeContext[purpose] || "product launch conversion"}

${frameworkInstructions[framework]}

ANTI-SPAM RULES:
- No ALL CAPS words (except one per email max)
- No exclamation marks in subject lines
- No spam triggers: "free", "act now", "limited time", "click here", "buy now", "don't miss"
- Subject lines under 50 chars, lowercase style preferred
- Preview text under 50 chars

Return JSON:
{
  "sequenceTheme": "2-3 word theme",
  "narrativeArc": "One sentence describing the story arc",
  "storyAngles": ["10 bonus story angle ideas for future emails"],
  "emails": [
    {
      "day": 1,
      "focus": "focus-type",
      "hookStyle": "curiosity|confession|discovery|story|contrarian|observation",
      "subject": "under 50 chars",
      "previewText": "under 50 chars",
      "openingHook": "2-3 sentence hook",
      "storyAnalogy": "main body (3-4 short paragraphs, max 250 words)",
      "lessonTwist": "the insight or twist",
      "offerBridge": "natural transition to product or next email",
      "cta": "one specific CTA",
      "ps": "P.S. line with extra hook",
      "spamScore": 0
    }
  ]
}

FINAL RULES:
- Every subject line under 50 chars
- Every email under 300 words total
- ONE CTA per email
- Open every email with a hook — never a corporate greeting
- Sound like a real person, not an AI
- Each email must make the reader want to open the next one`;

    const { content } = await callTieredAI([
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
