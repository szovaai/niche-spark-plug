import type { BoostScoreResult } from "@/types/toolkit";

export interface BoostScoreInput {
  title?: string;
  subtitle?: string;
  hook?: string;
  promise?: string;
  audience?: string;
  productDescription?: string;
  upsellBridge?: string;
  salesPageBullets?: string[];
  niche?: string;
}

const POWER_WORDS = ["proven", "secret", "ultimate", "instant", "fast", "easy", "simple", "complete", "guaranteed", "exclusive", "breakthrough", "blueprint", "system", "method", "protocol", "formula", "framework"];
const PAIN_WORDS = ["stop", "wasting", "frustrated", "stuck", "tired", "struggle", "fail", "broke", "burn", "overwhelmed", "confused", "lost", "without", "never", "no more"];
const SPEED_WORDS = ["minute", "hour", "day", "week", "today", "tonight", "friday", "instantly", "fast", "quick", "rapid", "overnight", "immediately"];
const AUDIENCE_QUALIFIERS = ["beginner", "even if", "no experience", "without", "for ", "anyone", "creators", "entrepreneurs", "moms", "founders", "freelancers"];
const RESULT_WORDS = ["sales", "income", "revenue", "money", "$", "leads", "subscribers", "followers", "results", "transformation"];

const score = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const has = (text: string, words: string[]) => words.some(w => text.toLowerCase().includes(w));
const countMatches = (text: string, words: string[]) => words.filter(w => text.toLowerCase().includes(w)).length;

export function calculateBoostScore(input: BoostScoreInput): BoostScoreResult {
  const title = input.title || "";
  const subtitle = input.subtitle || "";
  const hook = input.hook || subtitle || title;
  const promise = input.promise || subtitle || "";
  const audience = input.audience || "";
  const desc = input.productDescription || "";
  const upsell = input.upsellBridge || "";
  const bullets = input.salesPageBullets || [];
  const blob = `${title} ${subtitle} ${hook} ${promise} ${desc}`.toLowerCase();

  // 1. Title strength: length, power words, specificity
  let titleScore = 0;
  if (title.length >= 20 && title.length <= 80) titleScore += 35;
  else if (title.length > 0) titleScore += 15;
  titleScore += Math.min(35, countMatches(title, POWER_WORDS) * 12);
  if (/\d/.test(title)) titleScore += 20;
  if (title.includes(":")) titleScore += 10;

  // 2. Hook clarity: specificity, "without/even if" patterns
  let hookScore = hook.length > 30 ? 30 : hook.length;
  if (/even if|without|no .{1,15} (needed|required)/i.test(hook)) hookScore += 25;
  if (has(hook, SPEED_WORDS)) hookScore += 20;
  if (has(hook, RESULT_WORDS)) hookScore += 20;

  // 3. Buyer pain: presence of pain language
  let painScore = countMatches(blob, PAIN_WORDS) * 15;
  if (desc.length > 100) painScore += 20;

  // 4. Promise specificity: numbers, timeframes, concrete outcomes
  let promiseScore = 20;
  if (/\d/.test(promise + title)) promiseScore += 25;
  if (has(promise + title, SPEED_WORDS)) promiseScore += 30;
  if (has(promise + title, RESULT_WORDS)) promiseScore += 25;

  // 5. Speed/result appeal
  let speedScore = countMatches(title + " " + subtitle, SPEED_WORDS) * 25;
  if (/\d+\s*(minute|hour|day|week)/i.test(title + " " + subtitle)) speedScore += 40;

  // 6. Audience clarity
  let audScore = audience.length > 10 ? 35 : 0;
  audScore += countMatches(blob, AUDIENCE_QUALIFIERS) * 15;
  if (input.niche && input.niche.length > 2) audScore += 20;

  // 7. Monetization potential: result words, $, numbers
  let monScore = 25;
  if (blob.includes("$") || /\d+\s*(sales|dollars|profit|revenue)/i.test(blob)) monScore += 30;
  monScore += countMatches(blob, RESULT_WORDS) * 8;

  // 8. Differentiation: power words + unique mechanism cues
  let diffScore = 25;
  if (/protocol|method|framework|system|blueprint|formula/i.test(title + subtitle)) diffScore += 30;
  if (countMatches(blob, POWER_WORDS) >= 2) diffScore += 25;
  if (desc.length > 200) diffScore += 20;

  // 9. Upsell alignment
  let upsellScore = upsell.length > 0 ? 60 : 25;
  if (upsell.length > 100) upsellScore += 25;
  if (has(upsell, RESULT_WORDS)) upsellScore += 15;

  // 10. Traffic potential: bullets, hook breadth, audience breadth
  let trafficScore = bullets.length * 8;
  if (bullets.length >= 5) trafficScore += 20;
  if (has(blob, SPEED_WORDS)) trafficScore += 15;
  if (has(blob, AUDIENCE_QUALIFIERS)) trafficScore += 15;
  trafficScore += Math.min(20, audience.length / 3);

  const categories = {
    titleStrength: { score: score(titleScore), tip: titleScore < 60 ? "Add a number, timeframe, or power word (Protocol, Blueprint, System)." : "Strong — keep it punchy under 80 chars." },
    hookClarity: { score: score(hookScore), tip: hookScore < 60 ? "Add 'even if…' or 'without…' to handle the top objection." : "Hook handles objections clearly." },
    buyerPain: { score: score(painScore), tip: painScore < 60 ? "Open with the pain: 'Stop wasting hours on…'." : "Pain is well established." },
    promiseSpecificity: { score: score(promiseScore), tip: promiseScore < 60 ? "Quantify the outcome: number + timeframe + result." : "Promise is concrete." },
    speedAppeal: { score: score(speedScore), tip: speedScore < 60 ? "Front-load the time-to-result (60 minutes, by Friday)." : "Speed angle is clear." },
    audienceClarity: { score: score(audScore), tip: audScore < 60 ? "Name the audience explicitly (e.g., 'beginners with no list')." : "Audience is well defined." },
    monetizationPotential: { score: score(monScore), tip: monScore < 60 ? "Reference dollar amounts or revenue outcomes in the description." : "Money outcome reads strongly." },
    differentiation: { score: score(diffScore), tip: diffScore < 60 ? "Name your method (Protocol/Blueprint/Formula) and contrast vs alternatives." : "Differentiator is on-brand." },
    upsellAlignment: { score: score(upsellScore), tip: upsellScore < 60 ? "Write a 1–2 sentence upsell bridge tying the front-end win to the next outcome." : "Upsell bridge is solid." },
    trafficPotential: { score: score(trafficScore), tip: trafficScore < 60 ? "Add 5+ benefit bullets and reference a broad audience." : "Sharable across channels." },
  };

  const overall = Math.round(
    Object.values(categories).reduce((sum, c) => sum + c.score, 0) / 10
  );

  const band: BoostScoreResult["band"] =
    overall >= 85 ? "launch-ready" :
    overall >= 70 ? "strong" :
    overall >= 50 ? "needs-work" : "weak";

  return { overall, band, categories };
}

export const BAND_LABEL: Record<BoostScoreResult["band"], string> = {
  weak: "Weak",
  "needs-work": "Needs Work",
  strong: "Strong",
  "launch-ready": "Launch Ready",
};

export const BAND_CLASS: Record<BoostScoreResult["band"], string> = {
  weak: "text-destructive border-destructive/40 bg-destructive/10",
  "needs-work": "text-amber-500 border-amber-500/40 bg-amber-500/10",
  strong: "text-primary border-primary/40 bg-primary/10",
  "launch-ready": "text-emerald-500 border-emerald-500/40 bg-emerald-500/10",
};

export const CATEGORY_LABELS: Record<keyof BoostScoreResult["categories"], string> = {
  titleStrength: "Title Strength",
  hookClarity: "Hook Clarity",
  buyerPain: "Buyer Pain",
  promiseSpecificity: "Promise Specificity",
  speedAppeal: "Speed / Result Appeal",
  audienceClarity: "Audience Clarity",
  monetizationPotential: "Monetization Potential",
  differentiation: "Differentiation",
  upsellAlignment: "Upsell Alignment",
  trafficPotential: "Traffic Potential",
};
