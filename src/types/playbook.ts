export type PlaybookPlatform = 'etsy' | 'pinterest' | 'reddit' | 'facebook' | 'instagram' | 'email' | 'tiktok' | 'general';

export interface PlaybookTemplate {
  label: string;
  content: string;
}

export interface PlaybookStep {
  id: string;
  number: number;
  title: string;
  description: string;
  platform: PlaybookPlatform;
  timeEstimate: string;
  whyItWorks: string;
  templates: PlaybookTemplate[];
  tips: string[];
}

export interface PlaybookProgress {
  completedSteps: string[];
  startedAt: string | null;
  completedAt: string | null;
}

export interface FirstSalePlaybookData {
  productName: string;
  targetAudience: string;
  nicheName: string;
  productType: string;
  etsyTags: string[];
  steps: PlaybookStep[];
}
