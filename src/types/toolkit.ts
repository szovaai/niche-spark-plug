export type ContentDepth = 'quick' | 'standard' | 'premium' | 'authority';

export type BlendRatio = '70/30' | '60/40' | '50/50';

export interface VoiceBlend {
  primary: WritingStyle;
  secondary?: WritingStyle | null;
  ratio: BlendRatio;
}

export interface BoostScoreCategory {
  score: number;
  tip: string;
}

export interface BoostScoreResult {
  overall: number;
  band: 'weak' | 'needs-work' | 'strong' | 'launch-ready';
  categories: {
    titleStrength: BoostScoreCategory;
    hookClarity: BoostScoreCategory;
    buyerPain: BoostScoreCategory;
    promiseSpecificity: BoostScoreCategory;
    speedAppeal: BoostScoreCategory;
    audienceClarity: BoostScoreCategory;
    monetizationPotential: BoostScoreCategory;
    differentiation: BoostScoreCategory;
    upsellAlignment: BoostScoreCategory;
    trafficPotential: BoostScoreCategory;
  };
}

export type WritingStyle = 
  | 'conversational'    // Warm, friendly, coffee-chat vibe
  | 'professional'      // Authority, expertise, consultant tone
  | 'storytelling'      // Narrative arc, before/after, hooks
  | 'step-by-step'      // Action-first, numbered instructions
  | 'fun'               // Playful, energetic, emojis allowed
  | 'motivational'      // Inspiring, empowering, you-can-do-this
  | 'empowering'        // Confidence-building, belief-shifting
  | 'tactical'          // No-nonsense, straight-to-the-point, military precision
  | 'coaching';         // Supportive, question-based, reflective

export interface ToolkitComponents {
  guide: boolean;
  worksheet: boolean;
  checklist: boolean;
  resourceList: boolean;
  templates: boolean;
  quiz: boolean;
}

export interface ToolkitContent {
  guide?: {
    title: string;
    sections: {
      heading: string;
      content: string;
    }[];
  };
  worksheet?: {
    title: string;
    exercises: {
      title: string;
      instructions: string;
      fields: string[];
    }[];
  };
  checklist?: {
    title: string;
    items: string[];
  };
  resourceList?: {
    title: string;
    resources: {
      name: string;
      description: string;
      url?: string;
    }[];
  };
  templates?: {
    title: string;
    templates: {
      name: string;
      content: string;
    }[];
  };
  quiz?: {
    title: string;
    questions: {
      question: string;
      options: string[];
      correctIndex: number;
    }[];
  };
}

export interface ContentSummary {
  mainTransformation: string;
  chapterThemes: {
    chapter: string;
    theme: string;
    keyTakeaway: string;
  }[];
  uniqueMechanisms: string[];
  specificBenefits: string[];
  painPointsAddressed: string[];
  quotableInsights: string[];
  tableOfContents: string[];
}

export interface ToolkitUpsell {
  type: 'premium' | 'video' | 'dfy';
  title: string;
  description: string;
  price: number;
  salesPage?: string;
}

export interface Toolkit {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  niche: string;
  target_audience?: string;
  logo_url?: string;
  ecover_url?: string;
  components: ToolkitComponents;
  content: ToolkitContent;
  sales_letter?: string;
  upsell?: ToolkitUpsell;
  status: 'draft' | 'complete';
  downloads: number;
  created_at: string;
  updated_at: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface NicheIdea {
  name: string;
  description: string;
  targetAudience: string;
  painPoints: string[];
  productAngle: string;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

// Guide Section Builder Types
export type GuideSectionStatus = 'pending' | 'generating' | 'complete' | 'error';

export interface GuideSection {
  id: string;
  number: number;
  title: string;
  description: string;
  status: GuideSectionStatus;
  content: string | null;
  wordCount: number;
}

export const GUIDE_SECTION_TEMPLATES: GuideSection[] = [
  { id: "problem", number: 1, title: "The Problem", description: "Make the reader say 'This is exactly my problem'", status: "pending", content: null, wordCount: 0 },
  { id: "solution", number: 2, title: "The Solution Framework", description: "Introduce your core method", status: "pending", content: null, wordCount: 0 },
  { id: "foundation", number: 3, title: "Building Your Foundation", description: "Essential setup steps", status: "pending", content: null, wordCount: 0 },
  { id: "discovery", number: 4, title: "Discovery & Research", description: "Finding your buyers", status: "pending", content: null, wordCount: 0 },
  { id: "execution-1", number: 5, title: "Execution Plan Part 1", description: "First action steps", status: "pending", content: null, wordCount: 0 },
  { id: "execution-2", number: 6, title: "Execution Plan Part 2", description: "Advanced implementation", status: "pending", content: null, wordCount: 0 },
  { id: "optimization", number: 7, title: "Optimization & Testing", description: "Improve your results", status: "pending", content: null, wordCount: 0 },
  { id: "scaling", number: 8, title: "Scaling & Sustainability", description: "Grow and maintain success", status: "pending", content: null, wordCount: 0 },
];
