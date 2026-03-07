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
}

export interface Step2Content {
  outline: string;
  chapters: ChapterItem[];
  bonuses: string[];
  description: string;
}

export interface ChapterItem {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface Step3Funnel {
  salesPage: string;
  optInPage: string;
  thankYouPage: string;
  bonusPage: string;
  checkoutCopy: string;
  orderBump?: string;
  upsellOffer?: string;
}

export interface Step4Marketing {
  emails: EmailItem[];
  socialPosts: string[];
  pinterestPins: string[];
  blogArticle: string;
  videoScript: string;
  adCopy?: AdVariation[];
  targetingKeywords?: string[];
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
  { number: 3, title: "Funnel Copy", description: "Build your sales funnel" },
  { number: 4, title: "Marketing Assets", description: "Create promotional content" },
  { number: 5, title: "Launch Checklist", description: "Your launch roadmap" },
] as const;
