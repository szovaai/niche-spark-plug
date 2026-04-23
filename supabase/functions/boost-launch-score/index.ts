import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const {
      niche = "",
      targetAudience = "",
      productType = "",
      topic = "",
      productConcept = "",
      uniqueMechanism = "",
      selectedAngle = "",
      price = 17,
      launchScore,
    } = body;

    if (!launchScore) {
      return new Response(JSON.stringify({ error: "launchScore is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTier = await getUserTier(user.id);

    // Identify weakest dimensions (score <= 6)
    const dims = [
      { key: "demand", value: launchScore.demand, maps: ["niche", "topic"] },
      { key: "competition", value: launchScore.competition, maps: ["niche", "mechanism"] },
      { key: "monetization", value: launchScore.monetization, maps: ["price", "topic"] },
      { key: "audienceClarity", value: launchScore.audienceClarity, maps: ["audience"] },
      { key: "offerStrength", value: launchScore.offerStrength, maps: ["topic", "mechanism"] },
    ];
    const weakest = dims
      .filter(d => typeof d.value === "number" && d.value <= 6)
      .sort((a, b) => a.value - b.value)
      .slice(0, 3)
      .map(d => d.key);

    // Determine which fields to upgrade
    const fieldsToUpgrade = new Set<string>();
    weakest.forEach(w => {
      const d = dims.find(x => x.key === w);
      d?.maps.forEach(f => fieldsToUpgrade.add(f));
    });
    if (fieldsToUpgrade.size === 0) {
      // Default — boost everything if user clicked despite no weak dims
      ["niche", "audience", "topic", "mechanism", "price"].forEach(f => fieldsToUpgrade.add(f));
    }

    const prompt = `You are a direct-response launch strategist. The current launch has weak scores on: ${weakest.join(", ") || "general"}.

Current launch:
- Niche: ${niche}
- Target Audience: ${targetAudience || "Not defined"}
- Product Type: ${productType}
- Topic: ${topic}
- Product Concept: ${productConcept || "Not generated"}
- Unique Mechanism: ${uniqueMechanism || "Not selected"}
- Selected Angle: ${selectedAngle || "Not selected"}
- Front-End Price: $${price}

Current Score: ${launchScore.overall}/100
- demand: ${launchScore.demand}/10
- competition: ${launchScore.competition}/10
- monetization: ${launchScore.monetization}/10
- audienceClarity: ${launchScore.audienceClarity}/10
- offerStrength: ${launchScore.offerStrength}/10

Your job: Rewrite ONLY the inputs that map to weak dimensions to push the overall score above 80.
Fields you may upgrade: ${Array.from(fieldsToUpgrade).join(", ")}.

Rules:
- Sharpened niche: more specific, higher-intent variant (e.g., "Affiliate Marketing" → "Affiliate Marketing for Burned-Out 9-5ers")
- Tighter audience: a clearer "who" with pain trigger and timeframe (e.g., "5-year affiliates stuck under $1k/mo")
- Stronger topic angle: emotional/urgent reframe with specific outcome
- Mechanism upgrade: must use a Number, Timeframe, or Acronym formula (e.g., "The 7-Day Traffic Loop", "The C.A.S.H. Method")
- Pricing tweak: only suggest a different price if monetization is weak; stay within realistic ceiling

Return ONLY valid JSON:
{
  "weakestDimensions": ${JSON.stringify(weakest)},
  "upgrades": {
    "niche": { "current": "...", "improved": "...", "why": "one sentence why this scores higher" },
    "audience": { "current": "...", "improved": "...", "why": "..." },
    "topic": { "current": "...", "improved": "...", "why": "..." },
    "mechanism": { "current": "...", "improved": "Name — Tagline", "why": "..." },
    "price": { "current": ${price}, "improved": 27, "why": "..." }
  },
  "projectedScore": 84,
  "summary": "One-sentence summary of the boost strategy"
}

Only include keys in "upgrades" for fields that need improving. Skip fields that are already strong.`;

    const { content } = await callTieredAI([{ role: "user", content: prompt }], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("boost-launch-score error:", error);
    return new Response(JSON.stringify({ error: "Unable to boost launch score. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
