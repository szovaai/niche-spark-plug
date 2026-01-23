// AI Digital Product Empire Mode Types

export interface EmpireProject {
  id: string;
  user_id: string;
  name: string;
  status: 'in_progress' | 'complete';
  current_step: number;
  created_at: string;
  updated_at: string;
  
  // Step 1: Niche Finder
  step1_niches_input: NicheInput | null;
  step1_niche_analysis: NicheAnalysis | null;
  step1_final_niche: string | null;
  
  // Step 2: Brand Setup
  step2_brand_options: BrandOption[] | null;
  step2_selected_brand: string | null;
  step2_logo_prompts: LogoPrompts | null;
  step2_social_bios: SocialBios | null;
  step2_warming_checklist: WarmingDay[] | null;
  
  // Step 3: Product Pack
  step3_product_brief: ProductPack | null;
  step3_selected_product: string | null;
  step3_price_range: string | null;
  step3_sheet_schema: SheetSchema | null;
  step3_manual_text: string | null;
  
  // Step 4: Gumroad Launch
  step4_listing_copy: GumroadListing | null;
  step4_visual_prompts: VisualPrompts | null;
  step4_delivery_instructions: string | null;
  step4_domain_ideas: string[] | null;
  
  // Step 5: Content Engine
  step5_content_patterns: ContentPattern[] | null;
  step5_viral_ideas: ViralIdea[] | null;
  step5_scripts: ContentScript[] | null;
  step5_content_calendar: CalendarEntry[] | null;
  
  // Step 6: Automation
  step6_schedule_plan: SchedulePlan | null;
  step6_engagement_checklist: EngagementItem[] | null;
  step6_ad_angles: AdAngle[] | null;
}

// Step 1 Types
export interface NicheInput {
  niches: string[];
  interests: string;
  problemType: string;
}

export interface NicheScore {
  name: string;
  paying_score: number;
  interest_score: number;
  virality_score: number;
  notes: string;
}

export interface NicheAnalysis {
  niches: NicheScore[];
  top_three: string[];
  recommended: {
    name: string;
    reason: string;
  };
}

// Step 2 Types
export interface BrandOption {
  name: string;
  handles: string[];
}

export interface LogoPrompts {
  monogram_prompt: string;
  symbol_prompt: string;
}

export interface SocialBios {
  instagram_bio: string;
  tiktok_bio: string;
}

export interface WarmingDay {
  day: number;
  scroll_time: string;
  likes: number;
  comments: number;
  follows: number;
  completed?: boolean;
}

// Step 3 Types
export interface ProductPack {
  product_name: string;
  product_promise: string;
  urgency_reason: string;
  elements: string[];
  build_steps: string[];
  price_range: string;
}

export interface SheetTab {
  name: string;
  purpose: string;
  columns: { name: string; description: string }[];
}

export interface SheetSchema {
  tabs: SheetTab[];
}

// Step 4 Types
export interface GumroadListing {
  title: string;
  description: string;
  price: string;
  price_reason: string;
}

export interface VisualPrompts {
  hero_prompt: string;
  detail_prompts: string[];
}

// Step 5 Types
export interface ContentPattern {
  name: string;
  description: string;
  hook_style: string;
  structure: string;
}

export interface ViralIdea {
  id: string;
  topic: string;
  explanation: string;
  type: 'viral' | 'value' | 'both';
}

export interface ScriptScene {
  scene_number: number;
  narration: string;
  on_screen_text: string;
  image_prompt: string;
}

export interface ContentScript {
  id: string;
  topic: string;
  hook: string;
  scenes: ScriptScene[];
  cta: string;
}

export interface CalendarEntry {
  date: string;
  viral_video?: { topic: string; script_id?: string };
  value_video?: { topic: string; script_id?: string };
}

// Step 6 Types
export interface SchedulePlan {
  days_per_week: number;
  videos_per_day: number;
  weekly_total: number;
  summary: string;
  tips: string[];
}

export interface EngagementItem {
  id: string;
  task: string;
  target: string;
  completed?: boolean;
}

export interface AdAngle {
  id: string;
  angle_name: string;
  hook: string;
  benefit: string;
  cta: string;
}

// Empire Step Config
export interface EmpireStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export const EMPIRE_STEPS: EmpireStep[] = [
  { id: 1, title: 'Niche Finder', description: 'Find & validate your profitable niche', icon: 'Target' },
  { id: 2, title: 'Brand Setup', description: 'Create your faceless brand identity', icon: 'Palette' },
  { id: 3, title: 'Product Pack', description: 'Design your digital product', icon: 'Package' },
  { id: 4, title: 'Gumroad Launch', description: 'Set up your store & listing', icon: 'Store' },
  { id: 5, title: 'Content Engine', description: 'Build your viral content system', icon: 'Video' },
  { id: 6, title: 'Automation', description: 'Scale with scheduling & ads', icon: 'Rocket' },
];

export const PROBLEM_TYPES = [
  { value: 'time', label: 'Saving Time' },
  { value: 'money', label: 'Making Money' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'control', label: 'Life Control' },
  { value: 'mindset', label: 'Mindset & Growth' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'creativity', label: 'Creativity & Skills' },
];

export const BRAND_TONES = [
  { value: 'clean', label: 'Clean & Professional' },
  { value: 'techy', label: 'Techy & Modern' },
  { value: 'playful', label: 'Playful & Fun' },
  { value: 'luxury', label: 'Luxury & Premium' },
];

export const SYMBOL_STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'icon', label: 'Icon-based' },
];
