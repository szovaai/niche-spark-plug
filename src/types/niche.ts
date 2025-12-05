export type DemandTier = "Spark" | "Hot" | "On Fire";
export type CompetitionTier = "Easy" | "Moderate" | "Saturated";
export type MomentumDirection = "rising" | "steady" | "declining";

export interface NicheSnapshot {
  id: string;
  name: string;
  category: string;
  demandTier: DemandTier;
  competitionTier: CompetitionTier;
  momentum: MomentumDirection;
  priceRange: {
    min: number;
    max: number;
  };
  salesTier: DemandTier;
  platform: "Etsy" | "Shopify" | "Gumroad" | "Multiple";
}

export interface ProductPattern {
  id: string;
  name: string;
  priceRange: { min: number; max: number };
  formats: string[];
  difficulty: "Easy" | "Medium" | "Advanced";
  seasonality?: string;
}

export interface KeywordIdea {
  keyword: string;
  demandTier: DemandTier;
  competitionTier: CompetitionTier;
  suggestedProductType: string;
}

export interface PLRSource {
  id: string;
  name: string;
  description: string;
  features: string[];
  category: string;
  link: string;
  nicheRelevance?: string;
}

export interface ProductPack {
  productType: string;
  priceRange: { min: number; max: number };
  titleIdeas: string[];
  productOutline: string[];
  differentiatorTips: string[];
  bestPlatform: string;
  aiSummary: string;
}

export interface TrendingTopic {
  id: string;
  name: string;
  platform: "Etsy" | "Shopify" | "Multiple";
  momentum: MomentumDirection;
  category: string;
}