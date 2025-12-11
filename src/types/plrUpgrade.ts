export interface PLRUpgradeInput {
  plrTitle: string;
  plrDescription: string;
  plrContentSample: string;
  originalNiche: string;
  targetAudience: string;
  styleVibe: string;
  upgradeLevel: 'basic' | 'complete' | 'premium';
}

export interface ContentTransform {
  section: string;
  originalApproach: string;
  upgradedApproach: string;
  keyChanges: string[];
}

export interface StyleGuide {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPairing: string;
  aesthetic: string;
  moodKeywords: string[];
}

export interface EcoverConcept {
  style: string;
  description: string;
  keyElements: string[];
  colorScheme: string;
}

export interface UpsellIdea {
  productName: string;
  productType: string;
  description: string;
  priceRange: { min: number; max: number };
  whyItWorks: string;
}

export interface BundleStrategy {
  bundleName: string;
  includedProducts: string[];
  bundlePrice: { min: number; max: number };
  savingsMessage: string;
  marketingAngle: string;
}

export interface DifferentiationReport {
  uniquenessScore: number;
  keyDifferentiators: string[];
  competitiveAdvantages: string[];
  marketPositioning: string;
}

export interface PLRUpgradeOutput {
  upgradedTitle: string;
  rewrittenDescription: string;
  contentTransformations: ContentTransform[];
  styleOverhaul: StyleGuide;
  ecoverConcepts: EcoverConcept[];
  upsellIdeas: UpsellIdea[];
  bundleStrategy: BundleStrategy;
  differentiationReport: DifferentiationReport;
  marketingCopy: {
    headline: string;
    subheadline: string;
    bullets: string[];
    cta: string;
  };
}
