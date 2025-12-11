export interface MarketOverview {
  totalListings: string;
  averagePrice: string;
  dominantProductTypes: string[];
  marketMaturity: 'Emerging' | 'Growing' | 'Mature' | 'Saturated';
}

export interface OpportunityGap {
  id: string;
  title: string;
  description: string;
  demandSignal: 'Strong' | 'Moderate' | 'Emerging';
  difficultyToFill: 'Easy' | 'Medium' | 'Hard';
  suggestedProductType: string;
  potentialRevenue: string;
  whyItWorks: string;
}

export interface UnderservedAudience {
  audience: string;
  painPoints: string[];
  currentGap: string;
  productSuggestion: string;
  messagingAngle: string;
}

export interface MissingProduct {
  productType: string;
  reason: string;
  demandEvidence: string;
  implementationIdea: string;
}

export interface PricingGap {
  priceRange: string;
  observation: string;
  opportunity: string;
}

export interface QuickWin {
  title: string;
  effort: 'Low' | 'Medium' | 'High';
  potentialReward: 'Low' | 'Medium' | 'High';
  timeToMarket: string;
  description: string;
}

export interface CompetitorWeakness {
  weakness: string;
  howToExploit: string;
  exampleApproach: string;
}

export interface GapAnalysis {
  nicheName: string;
  marketOverview: MarketOverview;
  opportunityGaps: OpportunityGap[];
  underservedAudiences: UnderservedAudience[];
  missingProductTypes: MissingProduct[];
  pricingGaps: PricingGap[];
  quickWinOpportunities: QuickWin[];
  competitorWeaknesses: CompetitorWeakness[];
}
