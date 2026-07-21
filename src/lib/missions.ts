// Project Zero v2 — 12-mission ladder, weights, and default tasks per mission.
import type { MissionId } from "@/components/nova/StageMap";

export type MissionStatus = "locked" | "active" | "in_review" | "complete";

export interface MissionDef {
  id: MissionId;
  phase: string;
  phaseIndex: number;
  label: string;
  headline: string;
  promise: string;
  weight: number; // 0-100 sums to ~100
  tasks: { key: string; label: string }[];
  primaryAction?: { label: string; href?: (projectId: string) => string };
}

export const MISSIONS: MissionDef[] = [
  {
    id: "m0",
    phase: "Phase 1 · Discover",
    phaseIndex: 1,
    label: "Business Discovery",
    headline: "Get clear on you before we build anything.",
    promise: "Nova learns your skills, time, budget, and goals so every recommendation fits your reality.",
    weight: 5,
    tasks: [
      { key: "founder_profile_complete", label: "Complete your founder profile" },
      { key: "review_blueprint", label: "Review & approve your Project Zero Founder Profile" },
    ],
  },
  {
    id: "m1",
    phase: "Phase 1 · Discover",
    phaseIndex: 1,
    label: "Find Your Opportunity",
    headline: "Uncover 3-5 evidence-based niche opportunities.",
    promise: "Nova cross-references your skills with real demand signals and returns opportunities you can actually pursue.",
    weight: 10,
    tasks: [
      { key: "run_opportunity_research", label: "Run opportunity research" },
      { key: "review_shortlist", label: "Review Nova's shortlist" },
      { key: "select_opportunity", label: "Select one opportunity to pursue" },
    ],
    primaryAction: { label: "Open research", href: (id) => `/tools/opportunities?project=${id}` },
  },
  {
    id: "m2",
    phase: "Phase 2 · Validate",
    phaseIndex: 2,
    label: "Validate the Problem",
    headline: "Prove the problem is real, specific, and worth solving.",
    promise: "Get a validation report with transparent scoring for demand, urgency, competition, and monetization.",
    weight: 10,
    tasks: [
      { key: "validation_report", label: "Generate validation report" },
      { key: "review_scores", label: "Review scoring factors" },
      { key: "approve_problem", label: "Approve the validated problem statement" },
    ],
  },
  {
    id: "m3",
    phase: "Phase 3 · Build",
    phaseIndex: 3,
    label: "Choose the Product",
    headline: "Pick a focused digital-product concept.",
    promise: "Nova drafts three strong product options — you pick the one you'd be proud to launch.",
    weight: 10,
    tasks: [
      { key: "generate_concepts", label: "Generate 3 product concepts" },
      { key: "compare_concepts", label: "Compare and discuss with Nova" },
      { key: "approve_brief", label: "Approve the Product Brief" },
    ],
  },
  {
    id: "m4",
    phase: "Phase 3 · Build",
    phaseIndex: 3,
    label: "Build the Product",
    headline: "Create the product in staged, reviewable chunks.",
    promise: "Draft, refine, and approve section by section — nothing shipped without your sign-off.",
    weight: 20,
    tasks: [
      { key: "outline_approved", label: "Approve the outline" },
      { key: "draft_sections", label: "Draft all sections" },
      { key: "final_polish", label: "Final polish + cover" },
      { key: "export_ready", label: "Export package ready" },
    ],
    primaryAction: { label: "Open Product Studio", href: (id) => `/tools/wizard/${id}` },
  },
  {
    id: "m5",
    phase: "Phase 4 · Offer & Funnel",
    phaseIndex: 4,
    label: "Build the Offer",
    headline: "Turn the product into a commercial offer that converts.",
    promise: "Name, promise, price, bonuses, order bump, upsell, guarantee — an offer map, not a pile of bonuses.",
    weight: 10,
    tasks: [
      { key: "offer_map", label: "Draft the offer map" },
      { key: "pricing_decided", label: "Decide pricing & guarantee" },
      { key: "approve_offer", label: "Approve the Offer Architecture" },
    ],
  },
  {
    id: "m6",
    phase: "Phase 4 · Offer & Funnel",
    phaseIndex: 4,
    label: "Create Sales Assets",
    headline: "Generate everything you need to actually sell.",
    promise: "Sales page, checkout copy, order-bump, upsell, thank-you, FAQ — stored in your Asset Library.",
    weight: 10,
    tasks: [
      { key: "sales_page", label: "Generate sales page" },
      { key: "checkout_copy", label: "Generate checkout + bump + upsell" },
      { key: "approve_assets", label: "Approve core assets" },
    ],
    primaryAction: { label: "Open Sales Copy Engine", href: () => `/tools/sales-copy` },
  },
  {
    id: "m7",
    phase: "Phase 4 · Offer & Funnel",
    phaseIndex: 4,
    label: "Choose Funnel & Payments",
    headline: "Pick the right selling platform and connect payments.",
    promise: "Nova recommends fast/starter/advanced based on your budget and offer — never one-size-fits-all.",
    weight: 10,
    tasks: [
      { key: "funnel_path", label: "Select funnel path" },
      { key: "platform_setup", label: "Complete platform checklist" },
      { key: "payments_connected", label: "Connect payments + test transaction" },
    ],
  },
  {
    id: "m8",
    phase: "Phase 5 · Launch Assets",
    phaseIndex: 5,
    label: "Email Engine",
    headline: "Nova drafts your full Email Launch Engine.",
    promise: "Origin, Insight, Launch, and Value sequences — plus auto-repurposed social content.",
    weight: 5,
    tasks: [
      { key: "generate_campaigns", label: "Generate email campaigns" },
      { key: "review_emails", label: "Review & approve sequences" },
    ],
    primaryAction: { label: "Open Email Engine", href: (id) => `/project/${id}/launch-assets` },
  },
  {
    id: "m9",
    phase: "Phase 5 · Launch Assets",
    phaseIndex: 5,
    label: "Content Machine",
    headline: "Auto-repurpose everything into 6 traffic channels.",
    promise: "Turn emails and sales copy into pins, shorts, threads, posts, and reels.",
    weight: 5,
    tasks: [
      { key: "primary_channel", label: "Pick your primary traffic channel" },
      { key: "content_plan", label: "Approve 30-day content plan" },
    ],
    primaryAction: { label: "Open Social Engine", href: () => `/tools/social-engine` },
  },
  {
    id: "m10",
    phase: "Phase 6 · Launch & Grow",
    phaseIndex: 6,
    label: "Launch",
    headline: "Go live with a clear go/no-go checklist.",
    promise: "Every launch-day step accounted for — no scrambling.",
    weight: 10,
    tasks: [
      { key: "launch_checklist", label: "Complete launch checklist" },
      { key: "go_live", label: "Mark launch as live" },
    ],
    primaryAction: { label: "Open Launch Checklist", href: () => `/tools/checklist` },
  },
  {
    id: "m11",
    phase: "Phase 6 · Launch & Grow",
    phaseIndex: 6,
    label: "Improve",
    headline: "Review results and refine what worked.",
    promise: "Post-launch retro with Nova — what to double down on, what to fix, what to drop.",
    weight: 5,
    tasks: [
      { key: "capture_metrics", label: "Capture launch metrics" },
      { key: "retro_session", label: "Run a retro with Nova" },
    ],
  },
];

export const MISSION_BY_ID: Record<MissionId, MissionDef> = MISSIONS.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<MissionId, MissionDef>,
);

export function computeOverallProgress(missionPcts: Partial<Record<MissionId, number>>): number {
  const total = MISSIONS.reduce((sum, m) => sum + m.weight, 0);
  const scored = MISSIONS.reduce((sum, m) => sum + ((missionPcts[m.id] ?? 0) * m.weight) / 100, 0);
  return Math.round((scored / total) * 100);
}

export function nextMissionAfter(id: MissionId): MissionId | null {
  const idx = MISSIONS.findIndex((m) => m.id === id);
  if (idx < 0 || idx === MISSIONS.length - 1) return null;
  return MISSIONS[idx + 1].id;
}
