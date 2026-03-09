import { ChapterItem, Step2Content } from "@/types/launchWizard";

// ─── Word & phrase lists ────────────────────────────────────────────────────
const VAGUE_PHRASES = [
  "many", "some", "various", "several", "proven strategies", "proven methods",
  "key strategies", "best practices", "effective techniques", "powerful methods",
  "important tips", "great results", "amazing results", "incredible results",
  "game-changing", "revolutionary", "cutting-edge", "world-class", "top-notch",
  "leverage", "utilize", "optimize", "maximize", "streamline",
  "get success fast", "make money online", "unlock potential", "harness",
  "dive into", "journey", "at the end of the day", "in today's digital world",
  "in today's digital landscape", "leverage synergies",
];

const AI_SOUNDING = [
  "in today's digital landscape", "leverage synergies", "it's time to",
  "without further ado", "at the end of the day", "dive into",
  "let's explore", "it is important to note", "in conclusion",
  "furthermore", "additionally", "moreover", "comprehensive guide",
  "navigate the complexities", "harness the power", "elevate your",
  "game changer", "unlock your", "empower yourself",
];

const ACTION_VERBS = [
  "step", "do", "create", "build", "write", "set up", "configure", "install",
  "open", "click", "paste", "copy", "send", "upload", "download", "record",
  "schedule", "launch", "publish", "submit", "complete", "fill in", "sign up",
  "navigate", "select", "choose", "enter", "type", "drag", "drop",
];

const EXAMPLE_MARKERS = [
  "example", "case study", "for instance", "such as", "e.g.", "like when",
  "real-world", "real world", "here's how", "imagine", "let's say",
  "scenario", "story", "client", "student", "member", "customer",
];

const ASSET_WORDS = [
  "template", "checklist", "script", "swipe", "copy-paste", "plug-and-play",
  "done-for-you", "step-by-step", "walkthrough", "worksheet", "prompt",
  "fill-in-the-blank", "ready-to-use", "download",
];

const TIMELINE_MARKERS = [
  "within \\d+ minutes", "within \\d+ hours", "within \\d+ days",
  "by day \\d+", "in the first hour", "same day", "in the next \\d+",
  "today", "tonight", "this week", "day 1", "day 2", "day 3",
  "first \\d+ minutes", "first \\d+ hours",
];

const TRANSFORMATION_MARKERS = [
  "before", "after", "from .* to", "instead of", "no longer",
  "you'll go from", "transform", "become", "identity", "confidence",
  "you were .* now you",
];

const REFUND_RISK_PHRASES = [
  "guaranteed income", "guaranteed earnings", "you will definitely",
  "you will make \\$", "guaranteed to earn", "make \\$\\d+.*guaranteed",
  "100% guaranteed results", "impossible to fail",
];

const PROOF_MARKERS = [
  "screenshot", "example", "case study", "math", "calculation",
  "real life", "in practice", "here's what it looks like",
  "client", "student", "result", "earned", "generated",
  "\\$\\d+", "\\d+%", "roi",
];

// ─── Types ──────────────────────────────────────────────────────────────────
export interface DimensionScore {
  label: string;
  icon: string; // emoji
  score: number; // 0-100
  grade: string; // A-F
  details: string;
  coaching: string; // specific coaching message
  flaggedItems?: string[];
  status: "pass" | "needs-improvement" | "weak" | "unsafe";
}

export interface ContentAuditResult {
  overall: number;
  dimensions: DimensionScore[];
  canContinue: boolean;
  gateMessage?: string;
  coachingMessages: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getStatus(score: number): DimensionScore["status"] {
  if (score >= 75) return "pass";
  if (score >= 50) return "needs-improvement";
  if (score >= 30) return "weak";
  return "unsafe";
}

function countMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.reduce((count, phrase) => {
    try {
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      return count + (lower.match(regex) || []).length;
    } catch {
      return count + (lower.includes(phrase.toLowerCase()) ? 1 : 0);
    }
  }, 0);
}

function countRegexMatches(text: string, patterns: string[]): number {
  return patterns.reduce((count, pattern) => {
    try {
      const regex = new RegExp(pattern, "gi");
      return count + (text.match(regex) || []).length;
    } catch {
      return count;
    }
  }, 0);
}

function avgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length === 0) return 0;
  return sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
}

// ─── Audit a single chapter ─────────────────────────────────────────────────
export function auditChapter(chapter: ChapterItem): ContentAuditResult {
  const fullText = [
    chapter.title, chapter.summary,
    ...(chapter.keyPoints || []),
    chapter.hook || "", chapter.coreConcept || "",
    chapter.realExample || "", chapter.actionStep || "",
    ...(chapter.commonMistakes || []),
    ...(chapter.moduleSummary || []),
    ...(chapter.actionPlan?.map(a => `${a.step} ${a.action} ${a.why}`) || []),
    chapter.fullContent || "",
  ].join(" ");

  const wordCount = fullText.split(/\s+/).length;
  const dimensions: DimensionScore[] = [];
  const coaching: string[] = [];

  // 1) HUMAN READABILITY
  const aiCount = countMatches(fullText, AI_SOUNDING);
  const avgSentLen = avgSentenceLength(fullText);
  const hasContractions = /\b(you'll|don't|can't|won't|isn't|here's|that's|it's|we're|they're)\b/i.test(fullText);
  let humanScore = 100;
  humanScore -= aiCount * 12;
  if (avgSentLen > 22) humanScore -= (avgSentLen - 22) * 3;
  if (!hasContractions) humanScore -= 15;
  humanScore = Math.max(0, Math.min(100, humanScore));
  const flaggedAI = AI_SOUNDING.filter(p => fullText.toLowerCase().includes(p));
  if (humanScore < 70) coaching.push("This section sounds AI-written. Rewrite for natural, conversational tone.");
  dimensions.push({
    label: "Human Readability", icon: "🗣️", score: Math.round(humanScore), grade: getGrade(humanScore),
    details: `${aiCount} AI-sounding phrase(s), avg ${Math.round(avgSentLen)} words/sentence`,
    coaching: humanScore >= 75 ? "Reads naturally — good conversational flow." : "Sounds robotic. Use short sentences, contractions, and direct language.",
    flaggedItems: flaggedAI.length > 0 ? flaggedAI : undefined, status: getStatus(humanScore),
  });

  // 2) STEP-BY-STEP EXECUTION
  const actionCount = countMatches(fullText, ACTION_VERBS);
  const hasSteps = /step\s*\d|step\s*[one|two|three|four|five]/i.test(fullText);
  const hasActionPlan = (chapter.actionPlan?.length || 0) >= 3;
  const hasActionStep = !!chapter.actionStep;
  let execScore = Math.min(100, (actionCount * 6) + (hasSteps ? 20 : 0) + (hasActionPlan ? 25 : 0) + (hasActionStep ? 15 : 0));
  if (execScore < 60) coaching.push("This chapter explains, but does not instruct. Add numbered steps a beginner can follow.");
  dimensions.push({
    label: "Step-by-Step Execution", icon: "📋", score: Math.round(execScore), grade: getGrade(execScore),
    details: `${actionCount} action verbs, ${hasActionPlan ? "action plan present" : "no action plan"}`,
    coaching: execScore >= 75 ? "Clear step-by-step flow." : "Add specific numbered instructions. A beginner should know exactly what to do next.",
    status: getStatus(execScore),
  });

  // 3) OUTCOME SPECIFICITY
  const numberPattern = /\$\d+|\d+%|\d+\s*(day|week|month|hour|minute|client|sale|lead|customer)/gi;
  const numberMatches = (fullText.match(numberPattern) || []).length;
  const vagueCount = countMatches(fullText, VAGUE_PHRASES);
  let outcomeScore = Math.min(100, numberMatches * 10 - vagueCount * 8);
  outcomeScore = Math.max(0, outcomeScore);
  if (outcomeScore < 60) coaching.push("Your promised outcome is not tied to specific numbers or timeframes. Make it concrete.");
  dimensions.push({
    label: "Outcome Specificity", icon: "🎯", score: Math.round(outcomeScore), grade: getGrade(outcomeScore),
    details: `${numberMatches} specific metrics, ${vagueCount} vague phrase(s)`,
    coaching: outcomeScore >= 75 ? "Outcomes are specific and measurable." : "Replace vague claims with specific numbers: '$347 in 9 days', '3 clients in 2 weeks'.",
    flaggedItems: vagueCount > 0 ? VAGUE_PHRASES.filter(p => fullText.toLowerCase().includes(p)) : undefined,
    status: getStatus(outcomeScore),
  });

  // 4) TRANSFORMATION
  const transformCount = countRegexMatches(fullText, TRANSFORMATION_MARKERS);
  const hasModuleGoal = !!chapter.moduleGoal;
  let transformScore = Math.min(100, transformCount * 15 + (hasModuleGoal ? 25 : 0));
  if (transformScore < 50) coaching.push("No clear before/after transformation. Define who the reader becomes after this chapter.");
  dimensions.push({
    label: "Transformation", icon: "🦋", score: Math.round(transformScore), grade: getGrade(transformScore),
    details: `${transformCount} transformation indicator(s), ${hasModuleGoal ? "module goal set" : "no module goal"}`,
    coaching: transformScore >= 75 ? "Clear transformation arc defined." : "Add a before → after shift: who is the reader before, who are they after?",
    status: getStatus(transformScore),
  });

  // 5) ACTIONABILITY (assets, templates, checklists)
  const assetTextCount = countMatches(fullText, ASSET_WORDS);
  const assetObjCount = (chapter.caseStudies?.length || 0) + (chapter.worksheets?.length || 0) +
    (chapter.templates?.length || 0) + (chapter.checklists?.length || 0) + (chapter.additionalExamples?.length || 0);
  let actionabilityScore = Math.min(100, assetTextCount * 6 + assetObjCount * 20);
  if (actionabilityScore < 50) coaching.push("Add a checklist, script, or template to make this actionable. Every chapter should help them do something immediately.");
  dimensions.push({
    label: "Actionability", icon: "⚡", score: Math.round(actionabilityScore), grade: getGrade(actionabilityScore),
    details: `${assetObjCount} asset(s) attached, ${assetTextCount} actionable references in text`,
    coaching: actionabilityScore >= 75 ? "Good mix of done-for-you assets." : "Add templates, checklists, or scripts. Readers need plug-and-play materials.",
    status: getStatus(actionabilityScore),
  });

  // 6) TIME-TO-RESULT
  const timelineCount = countRegexMatches(fullText, TIMELINE_MARKERS);
  let timeScore = Math.min(100, timelineCount * 18);
  if (timeScore < 50) coaching.push("No realistic milestones. Break actions down by hour/day so the reader knows when to expect results.");
  dimensions.push({
    label: "Time-to-Result", icon: "⏱️", score: Math.round(timeScore), grade: getGrade(timeScore),
    details: `${timelineCount} time-based milestone(s) found`,
    coaching: timeScore >= 75 ? "Clear timeline milestones set." : "Add time anchors: 'within 60 minutes', 'by day 3', 'same day'.",
    status: getStatus(timeScore),
  });

  // 7) REFUND CONFIDENCE
  const riskyCount = countRegexMatches(fullText, REFUND_RISK_PHRASES);
  const clarityFactors = [hasSteps, hasActionPlan, hasActionStep, !!chapter.commonMistakes?.length].filter(Boolean).length;
  let refundScore = Math.min(100, (clarityFactors * 20) + 20 - (riskyCount * 25));
  refundScore = Math.max(0, refundScore);
  const riskyFound = REFUND_RISK_PHRASES.filter(p => {
    try { return new RegExp(p, "i").test(fullText); } catch { return false; }
  });
  if (riskyCount > 0) coaching.push("This claim may increase refund risk. Make promises more specific and believable.");
  if (refundScore < 60) coaching.push("Instructions aren't clear enough for beginners. A beginner may get stuck here — add a micro-step.");
  dimensions.push({
    label: "Refund Confidence", icon: "🛡️", score: Math.round(refundScore), grade: getGrade(refundScore),
    details: `${clarityFactors}/4 clarity factors, ${riskyCount} risky claim(s)`,
    coaching: refundScore >= 75 ? "Content is clear enough to support a confident guarantee." : "Simplify instructions and remove exaggerated claims. Clarity = fewer refunds.",
    flaggedItems: riskyFound.length > 0 ? riskyFound : undefined,
    status: getStatus(refundScore),
  });

  // 8) PROOF & BELIEVABILITY
  const proofCount = countRegexMatches(fullText, PROOF_MARKERS);
  const exampleCount = countMatches(fullText, EXAMPLE_MARKERS);
  let proofScore = Math.min(100, (proofCount * 8) + (exampleCount * 12));
  if (proofScore < 50) coaching.push("Add a real example here to improve trust. Include specific names, numbers, and outcomes.");
  dimensions.push({
    label: "Proof & Believability", icon: "📊", score: Math.round(proofScore), grade: getGrade(proofScore),
    details: `${proofCount} proof element(s), ${exampleCount} example(s)`,
    coaching: proofScore >= 75 ? "Well-supported with examples and proof." : "Add case studies, math, scenarios, or 'what this looks like in real life' sections.",
    status: getStatus(proofScore),
  });

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  const canContinue = overall >= 50 && !dimensions.some(d => d.status === "unsafe");
  const gateMessage = !canContinue
    ? "Your product needs improvement before continuing. Address the flagged issues below."
    : overall < 70
    ? "Your product can proceed, but improving flagged areas will boost conversions and reduce refunds."
    : undefined;

  return { overall, dimensions, canContinue, gateMessage, coachingMessages: coaching };
}

// ─── Full content audit (averages across chapters) ──────────────────────────
export function auditFullContent(content: Step2Content): ContentAuditResult {
  if (!content.chapters || content.chapters.length === 0) {
    return { overall: 0, dimensions: [], canContinue: false, gateMessage: "Generate content first.", coachingMessages: [] };
  }

  const chapterAudits = content.chapters.map(auditChapter);
  const allCoaching = [...new Set(chapterAudits.flatMap(a => a.coachingMessages))];

  const avgDimensions: DimensionScore[] = chapterAudits[0].dimensions.map((_, i) => {
    const avgScore = Math.round(chapterAudits.reduce((s, a) => s + a.dimensions[i].score, 0) / chapterAudits.length);
    const allFlagged = chapterAudits.flatMap(a => a.dimensions[i].flaggedItems || []);
    const uniqueFlagged = [...new Set(allFlagged)];
    const ref = chapterAudits[0].dimensions[i];
    return {
      label: ref.label,
      icon: ref.icon,
      score: avgScore,
      grade: getGrade(avgScore),
      details: `Average across ${chapterAudits.length} chapters`,
      coaching: avgScore >= 75 ? ref.coaching : chapterAudits.find(a => a.dimensions[i].score < 75)?.dimensions[i].coaching || ref.coaching,
      flaggedItems: uniqueFlagged.length > 0 ? uniqueFlagged : undefined,
      status: getStatus(avgScore),
    };
  });

  const overall = Math.round(avgDimensions.reduce((s, d) => s + d.score, 0) / avgDimensions.length);
  const hasUnsafe = avgDimensions.some(d => d.status === "unsafe");
  const canContinue = overall >= 50 && !hasUnsafe;
  const gateMessage = !canContinue
    ? "Your product needs improvement before continuing. Fix the flagged issues below."
    : overall < 70
    ? "Product can proceed, but addressing weak areas will boost conversions and reduce refunds."
    : undefined;

  return { overall, dimensions: avgDimensions, canContinue, gateMessage, coachingMessages: allCoaching };
}

// ─── Sales page audit (unchanged) ───────────────────────────────────────────
export interface ConversionElement {
  name: string;
  present: boolean;
  recommendation: string;
}

export function auditSalesPage(salesPageCopy: string): { score: number; elements: ConversionElement[] } {
  const text = salesPageCopy.toLowerCase();
  const elements: ConversionElement[] = [
    { name: "Pattern Interrupt", present: /^#|^##|!\[|attention|warning|stop|wait|imagine|what if/m.test(text), recommendation: "Add a bold, attention-grabbing headline that breaks the reader's scroll pattern." },
    { name: "Specific Promises", present: /\d+\s*(step|day|hour|minute|week|month|result|client|sale|dollar|\$|%)/i.test(text), recommendation: "Replace vague promises with specific numbers." },
    { name: "Social Proof", present: /testimonial|review|case study|student|client|member|said|result|rating|star/i.test(text), recommendation: "Add testimonials or case studies." },
    { name: "Clear CTA", present: /buy now|get instant access|add to cart|order now|grab your copy|start now|join now|enroll|sign up/i.test(text), recommendation: "Add a clear call-to-action." },
    { name: "Objection Handling", present: /faq|frequently asked|common question|concern|objection|but what if|worried|skeptic/i.test(text), recommendation: "Add an FAQ section." },
    { name: "Urgency/Scarcity", present: /limited|only \d+|deadline|expires|closing|last chance|spots left|today only/i.test(text), recommendation: "Add urgency or scarcity." },
    { name: "Risk Reversal", present: /guarantee|refund|money.?back|risk.?free|no.?risk|30.?day|60.?day/i.test(text), recommendation: "Add a guarantee." },
    { name: "Readability", present: salesPageCopy.includes("- ") || salesPageCopy.includes("• ") || salesPageCopy.includes("✅") || /\n\n/.test(salesPageCopy), recommendation: "Use bullet points and short paragraphs." },
    { name: "Video/Visual", present: /video|watch|demo|walkthrough|preview|screenshot/i.test(text), recommendation: "Add a video or demo section." },
    { name: "P.S. Line", present: /p\.s\.|p\.s:|ps:|ps\./i.test(text), recommendation: "Add a P.S. line." },
  ];
  const presentCount = elements.filter(e => e.present).length;
  return { score: Math.round((presentCount / elements.length) * 100), elements };
}
