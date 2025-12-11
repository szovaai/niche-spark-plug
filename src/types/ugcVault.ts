export type UGCAppCategory = 
  | 'UGC_VIDEO_MARKETPLACE'
  | 'UGC_APP_PROMO'
  | 'UGC_PHOTO_VIDEO_MARKETPLACE'
  | 'TRAVEL_UGC'
  | 'CREATOR_JOB_BOARD'
  | 'BRAND_PARTNERSHIP'
  | 'OTHER';

export type UGCContentType = 
  | 'SHORT_VIDEO'
  | 'PHOTO'
  | 'UNBOXING'
  | 'PRODUCT_REVIEW'
  | 'HOW_TO_TUTORIAL'
  | 'APP_PROMO'
  | 'TRAVEL_STORY';

export type UGCPlatform = 'IOS' | 'ANDROID' | 'WEB';

export type UGCPayModel = 
  | 'PER_VIDEO'
  | 'PER_PHOTO'
  | 'PER_PROJECT'
  | 'RETAINER'
  | 'PERFORMANCE_CPM'
  | 'AFFILIATE_COMMISSIONS'
  | 'PRODUCT_ONLY'
  | 'HYBRID';

export type UGCFollowersRequired = 'NONE' | 'SMALL' | 'MEDIUM' | 'LARGE';

export type UGCUserStatus = 'BOOKMARKED' | 'APPLIED' | 'APPROVED' | 'ACTIVE' | 'ON_PAUSE';

export interface UGCApp {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  short_tagline: string;
  description: string;
  category: UGCAppCategory[];
  content_types: UGCContentType[];
  platforms: UGCPlatform[];
  primary_audience: string | null;
  countries_supported: string[];
  followers_required: UGCFollowersRequired;
  pay_model: UGCPayModel[];
  typical_pay_min: number;
  typical_pay_max: number;
  currency: string;
  beginner_friendly_score: number;
  earning_potential_score: number;
  consistency_score: number;
  risk_notes: string | null;
  signup_url_web: string | null;
  signup_url_ios: string | null;
  signup_url_android: string | null;
  official_site_url: string | null;
  referral_program: boolean;
  referral_notes: string | null;
  how_it_works: string[];
  pros: string[];
  cons: string[];
  tips: string[];
  notes_for_creators: string | null;
  is_featured: boolean;
  is_pro_only: boolean;
  is_active: boolean;
  last_verified_at: string;
  created_at: string;
}

export interface UGCAppTag {
  id: string;
  name: string;
  tag_group: 'BENEFIT' | 'RISK' | 'NICHE';
  description: string | null;
  created_at: string;
}

export interface UGCUserAppStatus {
  id: string;
  user_id: string;
  app_id: string;
  status: UGCUserStatus;
  notes: string | null;
  estimated_monthly: number;
  created_at: string;
  updated_at: string;
}

export interface UGCAppFilters {
  category: UGCAppCategory | null;
  contentType: UGCContentType | null;
  platform: UGCPlatform | null;
  payModel: UGCPayModel | null;
  followersRequired: UGCFollowersRequired | null;
  beginnerFriendly: boolean;
}

export const CATEGORY_LABELS: Record<UGCAppCategory, string> = {
  UGC_VIDEO_MARKETPLACE: 'Video Marketplace',
  UGC_APP_PROMO: 'App Promo',
  UGC_PHOTO_VIDEO_MARKETPLACE: 'Photo/Video',
  TRAVEL_UGC: 'Travel',
  CREATOR_JOB_BOARD: 'Job Board',
  BRAND_PARTNERSHIP: 'Brand Partnerships',
  OTHER: 'Other'
};

export const CONTENT_TYPE_LABELS: Record<UGCContentType, string> = {
  SHORT_VIDEO: 'Short Video',
  PHOTO: 'Photo',
  UNBOXING: 'Unboxing',
  PRODUCT_REVIEW: 'Product Review',
  HOW_TO_TUTORIAL: 'How-To',
  APP_PROMO: 'App Promo',
  TRAVEL_STORY: 'Travel Story'
};

export const PAY_MODEL_LABELS: Record<UGCPayModel, string> = {
  PER_VIDEO: 'Per Video',
  PER_PHOTO: 'Per Photo',
  PER_PROJECT: 'Per Project',
  RETAINER: 'Retainer',
  PERFORMANCE_CPM: 'Performance (CPM)',
  AFFILIATE_COMMISSIONS: 'Affiliate',
  PRODUCT_ONLY: 'Product Only',
  HYBRID: 'Hybrid'
};

export const STATUS_LABELS: Record<UGCUserStatus, string> = {
  BOOKMARKED: 'Bookmarked',
  APPLIED: 'Applied',
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  ON_PAUSE: 'Paused'
};
