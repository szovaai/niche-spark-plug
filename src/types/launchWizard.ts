export interface CampaignAngle {
  name: string;
  hook: string;
  description: string;
}

export interface AdVariation {
  headline: string;
  primaryText: string;
  cta: string;
  hookAngle: string;
}

export interface PricingPsychology {
  tiers: { name: string; price: number; reasoning: string; recommended?: boolean }[];
  paymentPlanSuggestion: string;
  anchoringCopy: string;
  scarcityCopy: string;
  riskReversalCopy: string;
}

export interface LaunchScore {
  demand: number;
  competition: number;
  monetization: number;
  audienceClarity: number;
  offerStrength: number;
  overall: number;
  suggestions: string[];
  angleScores?: { angle: string; predictedConversion: string; reasoning: string }[];
  verdict?: "green" | "yellow" | "red";
  verdictMessage?: string;
  suggestedPivots?: string[];
  estimatedPriceCeiling?: number;
  affiliateCommissionSweet?: string;
  pricingPsychology?: PricingPsychology;
}

export interface Mechanism {
  name: string;
  tagline: string;
  description: string;
  formula?: string;
  whyItWorks?: string;
}

export interface BuyerAvatar {
  personaName: string;
  occupation: string;
  dailyFrustration: string;
  triedBefore: string;
  secretDream: string;
  biggestFear: string;
  languageTheyUse: string[];
  emotionalState: string;
  painPoints: string[];
  desires: string[];
  instantBuySentence: string;
  dayInTheLife: string;
}

export interface OfferStackItem {
  name: string;
  description: string;
  value: number;
}

export interface OfferStack {
  coreProduct: { name: string; value: number };
  bonuses: OfferStackItem[];
  totalValue: number;
  askingPrice: number;
  stackCopy: string;
}

export interface Objection {
  objection: string;
  reframe: string;
  proof: string;
  followUpQuestion: string;
}

export interface AffiliateKit {
  headline: string;
  emailSwipes: { subject: string; body: string }[];
  promoAngles: string[];
  bonusPageHeadline: string;
  jvPageCopy: string;
}

export interface ProofStack {
  testimonialTemplates: { name: string; before: string; product: string; result: string; lifeNow: string }[];
  beforeAfterTable: { before: string; after: string }[];
  credibilityBuilder: string;
  earningsDisclaimer: string;
  quickWinsList: string[];
}

export interface LaunchProject {
  id: string;
  user_id: string;
  name: string;
  status: string;
  niche: string | null;
  target_audience: string | null;
  product_type: string | null;
  topic: string | null;
  step1_product: Step1Product | null;
  step2_product_content: Step2Content | null;
  step3_funnel: Step3Funnel | null;
  step4_marketing: Step4Marketing | null;
  step5_checklist: Step5Checklist | null;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface Step1Product {
  title: string;
  subtitle: string;
  concept: string;
  uniqueMechanism: string;
  painPoints: string[];
  campaignAngles?: CampaignAngle[];
  selectedAngle?: string;
  launchScore?: LaunchScore;
  mechanisms?: Mechanism[];
}

export interface Step2Content {
  outline: string;
  chapters: ChapterItem[];
  bonuses: string[];
  description: string;
  proofStack?: ProofStack;
}

export interface Step3Graphics {
  coverUrl: string | null;
  bundleUrl: string | null;
  bonusCoverUrls: string[];
}

export interface ActionPlanStep {
  step: string;
  action: string;
  why: string;
}

export interface ChapterItem {
  title: string;
  summary: string;
  keyPoints: string[];
  moduleGoal?: string;
  hook?: string;
  coreConcept?: string;
  actionPlan?: ActionPlanStep[];
  realExample?: string;
  commonMistakes?: string[];
  actionStep?: string;
  moduleSummary?: string[];
}

export type SalesStyle = "warriorplus" | "longform" | "vsl" | "short";

export interface SalesPageSections {
  patternInterrupt: string;
  bigPromise: string;
  curiosityHook: string;
  problemAgitation: string;
  mechanismIntro: string;
  systemSteps: string[];
  productBreakdown: { module: string; title: string; description: string; value: number }[];
  bonusStack: { name: string; description: string; value: number }[];
  testimonials: string;
  objectionHandling: string;
  guarantee: string;
  urgencyClose: string;
  callToAction: string;
  socialProofBar?: string;
  buyerSignals?: string;
  implementationPath?: string;
}

export interface Step3Funnel {
  salesPage: string;
  salesPageSections?: SalesPageSections;
  salesStyle?: SalesStyle;
  optInPage: string;
  thankYouPage: string;
  bonusPage: string;
  checkoutCopy: string;
  orderBump?: string;
  upsellOffer?: string;
  offerStack?: OfferStack;
  objections?: Objection[];
}

export interface Step4Marketing {
  emails: EmailItem[];
  socialPosts: string[];
  pinterestPins: string[];
  blogArticle: string;
  videoScript: string;
  adCopy?: AdVariation[];
  targetingKeywords?: string[];
  affiliateKit?: AffiliateKit;
}

export interface EmailItem {
  subject: string;
  body: string;
}

export interface Step5Checklist {
  steps: ChecklistStep[];
}

export interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  day?: number;
}

export const PRODUCT_TYPES = [
  { value: "ebook", label: "Ebook" },
  { value: "course", label: "Course" },
  { value: "templates", label: "Templates" },
  { value: "checklist", label: "Checklist" },
  { value: "planner", label: "Planner" },
] as const;

export const WIZARD_STEPS = [
  { number: 1, title: "Product Setup", description: "Define your niche and product" },
  { number: 2, title: "Product Content", description: "Generate your product" },
  { number: 3, title: "Product Graphics", description: "Generate product visuals" },
  { number: 4, title: "Funnel Copy", description: "Build your sales funnel" },
  { number: 5, title: "Marketing Assets", description: "Create promotional content" },
  { number: 6, title: "Launch Checklist", description: "Your launch roadmap" },
] as const;
