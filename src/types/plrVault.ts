export type PLRNicheCategory = 
  | 'health_fitness'
  | 'mindset_manifestation'
  | 'online_business'
  | 'productivity'
  | 'self_improvement'
  | 'relationships'
  | 'spirituality'
  | 'money_investing';

export type PLRProductType = 
  | 'ebook'
  | 'planner'
  | 'journal'
  | 'workbook'
  | 'checklist'
  | 'challenge'
  | 'templates'
  | 'printable'
  | 'worksheet';

export type PLRFunnelRole = 
  | 'lead_magnet'
  | 'front_end'
  | 'upsell'
  | 'bonus';

export type PLRLicenseType = 
  | 'editable_sellable'
  | 'can_rebrand'
  | 'no_resell_plr';

export interface PLRVaultItem {
  id: string;
  title: string;
  description: string;
  content_sample: string | null;
  niche_category: PLRNicheCategory;
  product_type: PLRProductType;
  funnel_role: PLRFunnelRole;
  suggested_price_min: number;
  suggested_price_max: number;
  license_type: PLRLicenseType;
  tags: string[];
  is_active: boolean;
  is_pro_only: boolean;
  created_at: string;
}

export interface PLRQuickstartKit {
  id: string;
  title: string;
  description: string;
  niche_category: PLRNicheCategory;
  included_item_ids: string[];
  suggested_funnel_order: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_featured: boolean;
  is_pro_only: boolean;
  created_at: string;
}

export interface PLRPrefill {
  kitId?: string;
  kitTitle: string;
  nicheCategory: PLRNicheCategory;
  description: string;
  contentSample?: string;
  suggestedType?: string;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  funnelRole?: PLRFunnelRole;
}

export const PLR_NICHE_CATEGORIES: { value: PLRNicheCategory; label: string; icon: string; description: string }[] = [
  { value: 'health_fitness', label: 'Health & Fitness', icon: '💪', description: 'Workout plans, meal prep, wellness' },
  { value: 'mindset_manifestation', label: 'Mindset & Manifestation', icon: '✨', description: 'Law of attraction, affirmations, vision boards' },
  { value: 'online_business', label: 'Online Business', icon: '💼', description: 'Etsy, digital products, marketing' },
  { value: 'productivity', label: 'Productivity', icon: '⚡', description: 'Time management, habits, goal setting' },
  { value: 'self_improvement', label: 'Self-Improvement', icon: '🌱', description: 'Personal growth, confidence, journaling' },
  { value: 'relationships', label: 'Relationships', icon: '💝', description: 'Dating, communication, boundaries' },
  { value: 'spirituality', label: 'Spirituality', icon: '🧘', description: 'Meditation, energy work, mindfulness' },
  { value: 'money_investing', label: 'Money & Investing', icon: '💰', description: 'Budgeting, saving, financial freedom' },
];

export const PLR_GOALS: { value: string; label: string; icon: string; description: string }[] = [
  { value: 'launch_product', label: 'Launch a Product', icon: '🚀', description: 'Create your main sellable product' },
  { value: 'create_lead_magnet', label: 'Create a Lead Magnet', icon: '🧲', description: 'Build your email list with a freebie' },
  { value: 'create_upsell', label: 'Create an Upsell/Bonus', icon: '💎', description: 'Add value to existing products' },
];
