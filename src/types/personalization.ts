// Personalization Engine Types for MVP 2.0

export type TargetAudience = 
  | "Busy Moms"
  | "Students"
  | "Teachers"
  | "Nurses & Healthcare"
  | "Entrepreneurs"
  | "Corporate Professionals"
  | "Creatives & Artists"
  | "Fitness Enthusiasts"
  | "Newlyweds & Couples"
  | "Small Business Owners"
  | "Remote Workers"
  | "New Parents"
  | "Retirees"
  | "Gen Z Women";

export type TransformationFocus = 
  | "Calm & Stress Relief"
  | "Productivity & Focus"
  | "Organization & Order"
  | "Confidence & Self-Love"
  | "Health & Wellness"
  | "Financial Freedom"
  | "Creativity & Inspiration"
  | "Work-Life Balance"
  | "Goal Achievement"
  | "Mindfulness & Presence";

export type StyleVibe = 
  | "Minimalist Clean"
  | "Boho Aesthetic"
  | "Corporate Professional"
  | "Cute & Playful"
  | "Dark & Moody"
  | "Pastel Soft"
  | "Bold & Colorful"
  | "Vintage Retro"
  | "Luxury & Elegant"
  | "Nature & Organic";

export type PriceTier = 
  | "Budget ($3-8)"
  | "Value ($8-15)"
  | "Premium ($15-30)"
  | "Luxury ($30+)";

export interface PersonalizationData {
  targetAudience: TargetAudience;
  transformationFocus: TransformationFocus;
  styleVibe: StyleVibe;
  priceTier: PriceTier;
}

// Options for the UI selectors
export const TARGET_AUDIENCES: { value: TargetAudience; label: string; icon: string }[] = [
  { value: "Busy Moms", label: "Busy Moms", icon: "👩‍👧" },
  { value: "Students", label: "Students", icon: "🎓" },
  { value: "Teachers", label: "Teachers", icon: "📚" },
  { value: "Nurses & Healthcare", label: "Nurses & Healthcare", icon: "🏥" },
  { value: "Entrepreneurs", label: "Entrepreneurs", icon: "🚀" },
  { value: "Corporate Professionals", label: "Corporate Professionals", icon: "💼" },
  { value: "Creatives & Artists", label: "Creatives & Artists", icon: "🎨" },
  { value: "Fitness Enthusiasts", label: "Fitness Enthusiasts", icon: "💪" },
  { value: "Newlyweds & Couples", label: "Newlyweds & Couples", icon: "💑" },
  { value: "Small Business Owners", label: "Small Business Owners", icon: "🏪" },
  { value: "Remote Workers", label: "Remote Workers", icon: "🏠" },
  { value: "New Parents", label: "New Parents", icon: "👶" },
  { value: "Retirees", label: "Retirees", icon: "🌴" },
  { value: "Gen Z Women", label: "Gen Z Women", icon: "✨" },
];

export const TRANSFORMATION_FOCUSES: { value: TransformationFocus; label: string; icon: string }[] = [
  { value: "Calm & Stress Relief", label: "Calm & Stress Relief", icon: "🧘" },
  { value: "Productivity & Focus", label: "Productivity & Focus", icon: "⚡" },
  { value: "Organization & Order", label: "Organization & Order", icon: "📋" },
  { value: "Confidence & Self-Love", label: "Confidence & Self-Love", icon: "💖" },
  { value: "Health & Wellness", label: "Health & Wellness", icon: "🌿" },
  { value: "Financial Freedom", label: "Financial Freedom", icon: "💰" },
  { value: "Creativity & Inspiration", label: "Creativity & Inspiration", icon: "🎯" },
  { value: "Work-Life Balance", label: "Work-Life Balance", icon: "⚖️" },
  { value: "Goal Achievement", label: "Goal Achievement", icon: "🏆" },
  { value: "Mindfulness & Presence", label: "Mindfulness & Presence", icon: "🌸" },
];

export const STYLE_VIBES: { value: StyleVibe; label: string; icon: string; colors: string[] }[] = [
  { value: "Minimalist Clean", label: "Minimalist Clean", icon: "⬜", colors: ["#FFFFFF", "#000000", "#E5E5E5"] },
  { value: "Boho Aesthetic", label: "Boho Aesthetic", icon: "🌙", colors: ["#D4A574", "#8B4513", "#F5DEB3"] },
  { value: "Corporate Professional", label: "Corporate Professional", icon: "🔷", colors: ["#1E3A5F", "#FFFFFF", "#4A90A4"] },
  { value: "Cute & Playful", label: "Cute & Playful", icon: "🎀", colors: ["#FFB6C1", "#FFF0F5", "#FF69B4"] },
  { value: "Dark & Moody", label: "Dark & Moody", icon: "🖤", colors: ["#1A1A2E", "#16213E", "#0F3460"] },
  { value: "Pastel Soft", label: "Pastel Soft", icon: "🌈", colors: ["#E8D5E1", "#B8D4E3", "#D4E8D4"] },
  { value: "Bold & Colorful", label: "Bold & Colorful", icon: "🌟", colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"] },
  { value: "Vintage Retro", label: "Vintage Retro", icon: "📻", colors: ["#D4A574", "#8B7355", "#F4E4D4"] },
  { value: "Luxury & Elegant", label: "Luxury & Elegant", icon: "👑", colors: ["#D4AF37", "#1C1C1C", "#FFFFFF"] },
  { value: "Nature & Organic", label: "Nature & Organic", icon: "🌿", colors: ["#2D5016", "#90A955", "#ECF39E"] },
];

export const PRICE_TIERS: { value: PriceTier; label: string; icon: string; range: { min: number; max: number } }[] = [
  { value: "Budget ($3-8)", label: "Budget", icon: "💵", range: { min: 3, max: 8 } },
  { value: "Value ($8-15)", label: "Value", icon: "💰", range: { min: 8, max: 15 } },
  { value: "Premium ($15-30)", label: "Premium", icon: "💎", range: { min: 15, max: 30 } },
  { value: "Luxury ($30+)", label: "Luxury", icon: "👑", range: { min: 30, max: 100 } },
];
