export interface ReviewInsight {
  sentiment: 'positive' | 'negative' | 'neutral';
  theme: string;
  quote?: string;
}

export interface CompetitorAnalysis {
  originalProduct: {
    title: string;
    price: number;
    tags: string[];
    description: string;
    reviewInsights: ReviewInsight[];
    strengths: string[];
    weaknesses: string[];
    estimatedMonthlySales: string;
  };
  differentiationStrategy: {
    uniqueAngle: string;
    targetAudienceTwist: string;
    pricingStrategy: string;
    improvementOpportunities: string[];
    gapToExploit: string;
  };
  suggestedProduct: {
    newTitle: string;
    newDescription: string;
    suggestedPrice: { min: number; max: number };
    keyDifferentiators: string[];
    betterTags: string[];
    productType: string;
    targetAudience: string;
    styleVibe: string;
    transformationFocus: string;
  };
  competitiveAdvantages: string[];
  actionPlan: string[];
}
