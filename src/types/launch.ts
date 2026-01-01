export type LaunchPlatform = 'gumroad' | 'warriorplus' | 'digistore24' | 'systeme' | 'custom';

export interface LaunchStep {
  id: string;
  category: 'pre-launch' | 'platform' | 'sales-page' | 'testing' | 'promotion';
  title: string;
  description: string;
  platform?: LaunchPlatform | 'all';
  timeEstimate: string;
  instructions: string[];
  links?: { label: string; url: string }[];
  tips: string[];
}

export interface PlatformInfo {
  id: LaunchPlatform;
  name: string;
  tagline: string;
  description: string;
  pros: string[];
  cons: string[];
  setupUrl: string;
  icon: string;
  recommended?: boolean;
}

export interface LaunchProgress {
  id?: string;
  toolkitId: string;
  userId: string;
  selectedPlatform: LaunchPlatform | null;
  completedSteps: string[];
  liveUrl?: string;
  firstSaleDate?: string;
  startedAt: string;
  launchedAt?: string;
}

export interface LaunchChecklist {
  hasGuide: boolean;
  hasBonuses: boolean;
  hasCover: boolean;
  hasSalesLetter: boolean;
  hasPrice: boolean;
  hasProductName: boolean;
}

export interface ToolkitLaunchData {
  id: string;
  title: string;
  subtitle?: string;
  niche: string;
  targetAudience?: string;
  ecoverUrl?: string;
  salesLetter?: string;
  components: Record<string, boolean>;
  content: Record<string, unknown>;
  emailSequence?: unknown;
}

// Outsource types
export type OutsourceCategory = 
  | 'funnel-specialist' 
  | 'static-website' 
  | 'gumroad-expert' 
  | 'payment-integration' 
  | 'launch-assistant';

export interface OutsourceProvider {
  id: OutsourceCategory;
  title: string;
  icon: string;
  bestFor: string;
  searchTerms: string[];
  lookFor: string[];
  typicalCost: string;
  platforms: LaunchPlatform[];
}

export interface OutsourceTask {
  id: string;
  task: string;
  included: boolean;
}
