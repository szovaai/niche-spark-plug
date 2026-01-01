export type WritingStyle = 'conversational' | 'professional' | 'storytelling' | 'step-by-step';

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
