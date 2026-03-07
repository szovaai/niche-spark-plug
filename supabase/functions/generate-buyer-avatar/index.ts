import { corsHeaders, validateAuth, unauthorizedResponse } from "../_shared/auth.ts";
import { callTieredAI, getUserTier } from "../_shared/tieredAI.ts";
import { validateInput, validationErrorResponse } from "../_shared/validate.ts";
import { HUMAN_TONE_DIRECTIVE } from "../_shared/copyPrompts.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user, error: authError } = await validateAuth(req);
    if (authError || !user) return unauthorizedResponse(authError || 'Authentication required', corsHeaders);

    const body = await req.json();
    const { valid, error: valError, data } = validateInput(body, [
      { field: 'niche', type: 'string', required: true, maxLength: 200 },
      { field: 'targetAudience', type: 'string', maxLength: 500 },
      { field: 'topic', type: 'string', maxLength: 500 },
    ]);
    if (!valid) return validationErrorResponse(valError!, corsHeaders);

    const { niche, targetAudience, topic } = data;
    const userTier = await getUserTier(user.id);

    const prompt = `Create a hyper-specific buyer avatar for someone who would buy a digital product in this niche.

Niche: ${niche}
Target Audience: ${targetAudience || "General audience"}
Topic: ${topic || "General"}

Build a REAL person — not a marketing abstraction. This should feel like someone you could bump into at a coffee shop and recognize immediately.

Return ONLY valid JSON:
{
  "personaName": "A memorable alliterative name like 'Frustrated Frank' or 'Ambitious Amy' — the adjective must describe their emotional state",
  "occupation": "Their specific job or life situation (not vague — 'freelance graphic designer with 2 years experience' not 'creative professional')",
  "dailyFrustration": "The ONE thing that makes them mutter under their breath every single day related to this niche. Be viscerally specific.",
  "triedBefore": "2-3 specific things they've already tried that didn't work (name real-sounding products, courses, or approaches)",
  "secretDream": "What they fantasize about when nobody's watching — the transformation they want but are afraid to say out loud",
  "biggestFear": "Their #1 fear about buying yet another product (be honest — they've been burned before)",
  "languageTheyUse": ["exact phrase they'd say 1", "phrase 2", "phrase 3", "phrase 4", "phrase 5"],
  "emotionalState": "How they feel RIGHT NOW when they land on a sales page — one vivid sentence",
  "painPoints": ["specific pain 1 in their own words", "pain 2", "pain 3", "pain 4", "pain 5"],
  "desires": ["desire 1 — specific and measurable", "desire 2", "desire 3"],
  "instantBuySentence": "The ONE sentence that if they read on a sales page, they'd immediately click buy — this must feel like mind-reading",
  "dayInTheLife": "A 3-4 sentence paragraph written from THEIR perspective: what their morning looks like, when they feel the pain most acutely, and what triggers them to search for solutions"
}

RULES:
- Language they use must be casual, real phrases — not marketing speak
- Pain points must be emotional and specific — not "wants more traffic" but "watches YouTube videos about getting traffic until 2am but never implements anything"
- The instant buy sentence must be so specific it feels creepy-accurate
${HUMAN_TONE_DIRECTIVE}`;

    const { content } = await callTieredAI([{ role: "user", content: prompt }], userTier, "standard");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Unable to generate buyer avatar. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
