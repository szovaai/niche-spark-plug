import { ChapterItem, Step2Content } from "@/types/launchWizard";

const VAGUE_PHRASES = [
  "many", "some", "various", "several", "proven strategies", "proven methods",
  "key strategies", "best practices", "effective techniques", "powerful methods",
  "important tips", "great results", "amazing results", "incredible results",
  "game-changing", "revolutionary", "cutting-edge", "world-class", "top-notch",
  "leverage", "utilize", "optimize", "maximize", "streamline",
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

export interface DimensionScore {
  label: string;
  score: number; // 0-100
  grade: string; // A-F
  details: string;
  flaggedItems?: string[];
}

export interface ContentAuditResult {
  overall: number;
  dimensions: DimensionScore[];
}

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function countMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.reduce((count, phrase) => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    return count + (lower.match(regex) || []).length;
  }, 0);
}

export function auditChapter(chapter: ChapterItem): ContentAuditResult {
  const fullText = [
    chapter.title,
    chapter.summary,
    ...(chapter.keyPoints || []),
    chapter.hook || "",
    chapter.coreConcept || "",
    chapter.realExample || "",
    chapter.actionStep || "",
    ...(chapter.commonMistakes || []),
    ...(chapter.moduleSummary || []),
    ...(chapter.actionPlan?.map(a => `${a.step} ${a.action} ${a.why}`) || []),
  ].join(" ");

  const wordCount = fullText.split(/\s+/).length;

  // Specificity
  const vagueCount = countMatches(fullText, VAGUE_PHRASES);
  const vagueRatio = vagueCount / Math.max(wordCount / 50, 1);
  const specificityScore = Math.max(0, Math.min(100, 100 - vagueRatio * 25));
  const flaggedVague = VAGUE_PHRASES.filter(p => fullText.toLowerCase().includes(p));

  // Actionability
  const actionCount = countMatches(fullText, ACTION_VERBS);
  const hasSteps = /step\s*\d|step\s*[one|two|three|four|five]/i.test(fullText);
  const actionScore = Math.min(100, (actionCount * 8) + (hasSteps ? 20 : 0));

  // Example Density
  const exampleCount = countMatches(fullText, EXAMPLE_MARKERS);
  const exampleScore = Math.min(100, exampleCount * 30);

  // Theory/Tactics Ratio
  const theoryWords = ["understand", "concept", "theory", "principle", "mindset", "philosophy", "framework", "overview", "introduction", "background"];
  const tacticalWords = ["do", "create", "build", "template", "checklist", "script", "swipe", "copy-paste", "plug-and-play", "done-for-you", "step-by-step", "walkthrough"];
  const theoryCount = countMatches(fullText, theoryWords);
  const tacticalCount = countMatches(fullText, tacticalWords);
  const total = theoryCount + tacticalCount || 1;
  const tacticalRatio = tacticalCount / total;
  const ratioScore = Math.min(100, tacticalRatio * 140);

  const dimensions: DimensionScore[] = [
    {
      label: "Specificity",
      score: Math.round(specificityScore),
      grade: getGrade(specificityScore),
      details: vagueCount === 0 ? "No vague phrases detected" : `${vagueCount} vague phrase(s) found`,
      flaggedItems: flaggedVague.length > 0 ? flaggedVague : undefined,
    },
    {
      label: "Actionability",
      score: Math.round(actionScore),
      grade: getGrade(actionScore),
      details: `${actionCount} action verbs, ${hasSteps ? "step-by-step structure detected" : "no step-by-step structure"}`,
    },
    {
      label: "Example Density",
      score: Math.round(exampleScore),
      grade: getGrade(exampleScore),
      details: `${exampleCount} example(s)/case studies found (target: 3+)`,
    },
    {
      label: "Tactics Ratio",
      score: Math.round(ratioScore),
      grade: getGrade(ratioScore),
      details: `${Math.round(tacticalRatio * 100)}% tactical content (target: 70%+)`,
    },
  ];

  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  return { overall, dimensions };
}

export function auditFullContent(content: Step2Content): ContentAuditResult {
  if (!content.chapters || content.chapters.length === 0) {
    return { overall: 0, dimensions: [] };
  }

  const chapterAudits = content.chapters.map(auditChapter);
  const avgDimensions: DimensionScore[] = chapterAudits[0].dimensions.map((_, i) => {
    const avgScore = Math.round(chapterAudits.reduce((s, a) => s + a.dimensions[i].score, 0) / chapterAudits.length);
    const allFlagged = chapterAudits.flatMap(a => a.dimensions[i].flaggedItems || []);
    const uniqueFlagged = [...new Set(allFlagged)];
    return {
      label: chapterAudits[0].dimensions[i].label,
      score: avgScore,
      grade: getGrade(avgScore),
      details: `Average across ${chapterAudits.length} chapters`,
      flaggedItems: uniqueFlagged.length > 0 ? uniqueFlagged : undefined,
    };
  });

  const overall = Math.round(avgDimensions.reduce((s, d) => s + d.score, 0) / avgDimensions.length);

  return { overall, dimensions: avgDimensions };
}

// Sales page audit
export interface ConversionElement {
  name: string;
  present: boolean;
  recommendation: string;
}

export function auditSalesPage(salesPageCopy: string): { score: number; elements: ConversionElement[] } {
  const text = salesPageCopy.toLowerCase();

  const elements: ConversionElement[] = [
    {
      name: "Pattern Interrupt",
      present: /^#|^##|!\[|attention|warning|stop|wait|imagine|what if/m.test(text),
      recommendation: "Add a bold, attention-grabbing headline that breaks the reader's scroll pattern.",
    },
    {
      name: "Specific Promises",
      present: /\d+\s*(step|day|hour|minute|week|month|result|client|sale|dollar|\$|%)/i.test(text),
      recommendation: "Replace vague promises with specific numbers: '7 steps', '30 days', '$500 in revenue'.",
    },
    {
      name: "Social Proof",
      present: /testimonial|review|case study|student|client|member|said|result|rating|star/i.test(text),
      recommendation: "Add testimonials, case studies, or specific results from users above the fold.",
    },
    {
      name: "Clear CTA",
      present: /buy now|get instant access|add to cart|order now|grab your copy|start now|join now|enroll|sign up/i.test(text),
      recommendation: "Add a clear, prominent call-to-action button with action-oriented text.",
    },
    {
      name: "Objection Handling",
      present: /faq|frequently asked|common question|concern|objection|but what if|worried|skeptic/i.test(text),
      recommendation: "Add an FAQ or 'Common Concerns' section to address buyer hesitations.",
    },
    {
      name: "Urgency/Scarcity",
      present: /limited|only \d+|deadline|expires|closing|last chance|spots left|today only|bonus.*removed|price.*increase/i.test(text),
      recommendation: "Add a deadline, limited spots, or time-sensitive bonus to create urgency.",
    },
    {
      name: "Risk Reversal",
      present: /guarantee|refund|money.?back|risk.?free|no.?risk|30.?day|60.?day|full refund/i.test(text),
      recommendation: "Add a clear money-back guarantee to remove purchase risk.",
    },
    {
      name: "Readability",
      present: salesPageCopy.includes("- ") || salesPageCopy.includes("• ") || salesPageCopy.includes("✅") || /\n\n/.test(salesPageCopy),
      recommendation: "Break up text with bullet points, short paragraphs, and visual separators.",
    },
    {
      name: "Video/Visual",
      present: /video|watch|demo|walkthrough|preview|screenshot|image|thumbnail/i.test(text),
      recommendation: "Add a video placeholder or product demo section to increase engagement.",
    },
    {
      name: "P.S. Line",
      present: /p\.s\.|p\.s:|ps:|ps\./i.test(text),
      recommendation: "Add a P.S. line that reiterates the main benefit or adds final urgency.",
    },
  ];

  const presentCount = elements.filter(e => e.present).length;
  const score = Math.round((presentCount / elements.length) * 100);

  return { score, elements };
}
