export interface ResearchMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OpportunityIdea {
  title: string;
  audience: string;
  whyItSells: string[];
  productFormat: string;
  suggestedAngle: string;
  uniqueMechanism: string;
  monetizationScore: number;
  recommended?: boolean;
}

export interface OpportunityBrief {
  type: "opportunity_brief";
  ideas: OpportunityIdea[];
  niche: string;
  targetAudience: string;
  productType: string;
  topic: string;
  angle: string;
  mechanism: string;
}

export type ResearchMode = "pain_point" | "demand_led" | "competitor_gap" | "asset_first" | "trend_hijacking";
export type ResearchStyle = "fastest" | "warriorplus" | "listbuilding" | "recurring" | "existing_assets";

export const RESEARCH_MODES = [
  { value: "pain_point" as ResearchMode, label: "Pain Point Discovery", icon: "🎯", description: "Find ideas from audience frustrations" },
  { value: "demand_led" as ResearchMode, label: "Demand-Led Research", icon: "📈", description: "Discover what's already selling" },
  { value: "competitor_gap" as ResearchMode, label: "Competitor Gap", icon: "🔍", description: "Find what competitors are missing" },
  { value: "asset_first" as ResearchMode, label: "Asset-First", icon: "📦", description: "Monetize what you already have" },
  { value: "trend_hijacking" as ResearchMode, label: "Trend Hijacking", icon: "🔥", description: "Find profitable ideas from emerging trends before competitors launch" },
] as const;

export const RESEARCH_STYLES = [
  { value: "fastest" as ResearchStyle, label: "⚡ Fastest to Launch" },
  { value: "warriorplus" as ResearchStyle, label: "🎯 Best for WarriorPlus" },
  { value: "listbuilding" as ResearchStyle, label: "📧 Best for List Building" },
  { value: "recurring" as ResearchStyle, label: "🔄 Best for Recurring Income" },
  { value: "existing_assets" as ResearchStyle, label: "📦 From My Existing Assets" },
] as const;
