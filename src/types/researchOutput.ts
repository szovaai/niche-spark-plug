export interface ResearchOutput {
  source: 'niche-wizard' | 'gap-finder' | 'store-spy';
  suggestedTitle?: string;
  suggestedNiche: string;
  suggestedPrice?: { min: number; max: number };
  suggestedComponents?: {
    guide: boolean;
    worksheet: boolean;
    checklist: boolean;
    templates: boolean;
    quiz: boolean;
    resourceList: boolean;
  };
  targetAudience?: string;
  differentiationAngle?: string;
  upsellIdea?: string;
  marketplace?: 'etsy' | 'gumroad' | 'general';
}
