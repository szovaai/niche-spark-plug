// Email Launch Engine — campaign types + framework config for Nova's Phase 5.

export type EmailCampaignType =
  | "origin_story"   // 5-email nurture — story-first sequence
  | "insight"        // 7-email value drops — reframe + shift beliefs
  | "launch"         // 7-email launch sequence — Setup → Conflict → Offer → Close
  | "value"          // 5-email post-purchase — deepen the win
  | "welcome"        // 3-email new-subscriber intro
  | "reengagement";  // 5-email win-back for cold lists

export interface EmailCampaign {
  id: string;
  user_id: string;
  project_id: string | null;
  campaign_type: EmailCampaignType;
  email_number: number;
  subject: string;
  preview_text: string | null;
  body_html: string | null;
  body_text: string | null;
  cta: string | null;
  status: "draft" | "ready" | "sent";
  repurposed_content: RepurposedContent | null;
  created_at: string;
  updated_at: string;
}

export interface RepurposedContent {
  x_thread?: string;
  linkedin_post?: string;
  facebook_post?: string;
  instagram_caption?: string;
  tiktok_hook?: string;
  youtube_short?: string;
}

export const CAMPAIGN_CONFIG: Record<
  EmailCampaignType,
  { label: string; description: string; count: number; icon: string; color: string }
> = {
  origin_story: {
    label: "Origin Story",
    description: "5-email nurture that turns your story into trust.",
    count: 5,
    icon: "📖",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  insight: {
    label: "Insight",
    description: "7 belief-shifting value drops that reframe the problem.",
    count: 7,
    icon: "💡",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  launch: {
    label: "Launch",
    description: "7-email launch arc — Setup → Conflict → Discovery → Offer → Close.",
    count: 7,
    icon: "🚀",
    color: "bg-primary/20 text-primary border-primary/30",
  },
  value: {
    label: "Value",
    description: "5 post-purchase emails that deepen the win and unlock referrals.",
    count: 5,
    icon: "✨",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  welcome: {
    label: "Welcome",
    description: "3-email intro sequence for brand-new subscribers.",
    count: 3,
    icon: "👋",
    color: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  reengagement: {
    label: "Re-engagement",
    description: "5-email win-back for cold lists.",
    count: 5,
    icon: "🔁",
    color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
};

export const REPURPOSE_CHANNELS: Array<{ key: keyof RepurposedContent; label: string }> = [
  { key: "x_thread", label: "X Thread" },
  { key: "linkedin_post", label: "LinkedIn Post" },
  { key: "facebook_post", label: "Facebook Post" },
  { key: "instagram_caption", label: "Instagram Caption" },
  { key: "tiktok_hook", label: "TikTok Hook" },
  { key: "youtube_short", label: "YouTube Short" },
];
