export type DemandTier = "Spark" | "Hot" | "On Fire";
export type CompetitionTier = "Easy" | "Moderate" | "Saturated";
export type MomentumDirection = "rising" | "steady" | "declining";
export type LaunchSpeed = "Instant" | "1 Hour" | "1 Day";

// Product Types for AI Product Factory
export type ProductType = 
  | "Planner"
  | "Printable Pack"
  | "Canva Template"
  | "Notion Template"
  | "Spreadsheet"
  | "Guide"
  | "Wall Art"
  | "Social Media Kit"
  | "Digital Stickers";

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
  launchSpeed: LaunchSpeed;
  launchabilityScore: number;
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

// New types for Free vs Pro features
export interface LaunchPack {
  id: string;
  title: string;
  slug: string;
  nicheName: string;
  category: string;
  whyHot: string;
  plrSuggestion: PLRSource;
  listingTitle: string;
  listingBullets: string[];
  imageRecommendations: string[];
  promoIdea: string;
}

export interface LaunchRecipe {
  step: number;
  title: string;
  description: string;
  timeEstimate: string;
}

export interface StoreBlueprint {
  heroHeadline: string;
  sections: Array<{ name: string; description: string }>;
  recommendedPlatform: string;
  ctaSuggestion: string;
}

// MVP 2.5 - Enhanced Product Blueprint Types
export interface StyleGuide {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
  aesthetic: string;
  moodKeywords: string[];
}

export interface BlueprintPage {
  pageNumber: number;
  title: string;
  description: string;
  contentSuggestion: string;
  layoutNotes: string;
}

export interface MarketingCopy {
  shortDescription: string;
  fullDescription: string;
  bulletPoints: string[];
  seoTags: string[];
}

export interface ProductBlueprint {
  productName: string;
  productType: ProductType;
  priceRange: { min: number; max: number };
  pages: BlueprintPage[];
  styleGuide: StyleGuide;
  marketingCopy: MarketingCopy;
  titleIdeas: string[];
  uniqueAngles: string[];
  buyerPersona: string;
  aiSummary: string;
}

// Product Type Configuration
export interface ProductTypeConfig {
  type: ProductType;
  icon: string;
  label: string;
  description: string;
  avgPages: string;
  difficulty: "Easy" | "Medium" | "Advanced";
}

export const PRODUCT_TYPES: ProductTypeConfig[] = [
  { type: "Planner", icon: "📋", label: "Planner / Workbook", description: "Daily, weekly, monthly planners with habit trackers", avgPages: "20-50 pages", difficulty: "Easy" },
  { type: "Printable Pack", icon: "🖨️", label: "Printable Pack", description: "Wall art, checklists, trackers, worksheets", avgPages: "5-20 pages", difficulty: "Easy" },
  { type: "Canva Template", icon: "🎨", label: "Canva Template", description: "Editable Canva designs for social or print", avgPages: "10-30 templates", difficulty: "Medium" },
  { type: "Notion Template", icon: "📓", label: "Notion Template", description: "Notion dashboards, trackers, and systems", avgPages: "1-5 pages", difficulty: "Medium" },
  { type: "Spreadsheet", icon: "📊", label: "Spreadsheet", description: "Excel/Google Sheets budget, tracker templates", avgPages: "1-10 sheets", difficulty: "Medium" },
  { type: "Guide", icon: "📚", label: "Guide / Ebook", description: "PDF guides, how-to ebooks, mini courses", avgPages: "15-40 pages", difficulty: "Medium" },
  { type: "Wall Art", icon: "🖼️", label: "Wall Art Pack", description: "Printable art, quotes, aesthetic posters", avgPages: "5-20 designs", difficulty: "Easy" },
  { type: "Social Media Kit", icon: "📱", label: "Social Media Kit", description: "Instagram, Pinterest, TikTok templates", avgPages: "20-50 templates", difficulty: "Medium" },
  { type: "Digital Stickers", icon: "✨", label: "Digital Stickers", description: "GoodNotes/Notability sticker packs", avgPages: "50-200 stickers", difficulty: "Advanced" },
];
