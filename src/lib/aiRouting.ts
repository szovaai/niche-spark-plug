/**
 * Frontend mirror of supabase/functions/_shared/aiRouter.ts.
 * Used to render cost/speed estimates and option pickers.
 * Keep in sync with the backend matrix.
 */

export type TaskKind = "fast" | "longform" | "salescopy";
export type QualityMode = "economy" | "balanced" | "premium";
export type UserPreference =
  | "auto"
  | "fastest"
  | "best-writing"
  | "best-sales"
  | "cheapest";

export interface ModelMeta {
  label: string;
  costTier: 1 | 2 | 3 | 4 | 5;
  speedTier: 1 | 2 | 3 | 4 | 5;
}

export const QUALITY_MODES: { value: QualityMode; label: string; desc: string }[] = [
  { value: "economy",  label: "Economy",         desc: "Cheapest & fastest. Fine for drafts." },
  { value: "balanced", label: "Balanced",        desc: "Smart mix — best for most products." },
  { value: "premium",  label: "Premium Quality", desc: "Top-tier writing. Slower & costlier." },
];

export const MODEL_PREFERENCES: { value: UserPreference; label: string; desc: string }[] = [
  { value: "auto",          label: "Auto Select Best Model", desc: "Pick the right model per task automatically." },
  { value: "fastest",       label: "Fastest",                desc: "Fast Gemini Flash Lite on every call." },
  { value: "best-writing",  label: "Best Writing",           desc: "Always GPT-5 with extended reasoning." },
  { value: "best-sales",    label: "Best Sales Copy",        desc: "Always GPT-5 tuned for persuasion." },
  { value: "cheapest",      label: "Cheapest",               desc: "Lowest possible cost on every call." },
];

/** Mirror of backend ROUTING_MATRIX */
const ROUTING_MATRIX: Record<TaskKind, Record<QualityMode, ModelMeta>> = {
  fast: {
    economy:  { label: "Gemini 2.5 Flash Lite", costTier: 1, speedTier: 5 },
    balanced: { label: "Gemini 2.5 Flash Lite", costTier: 1, speedTier: 5 },
    premium:  { label: "Gemini 2.5 Flash",      costTier: 2, speedTier: 4 },
  },
  longform: {
    economy:  { label: "Gemini 2.5 Flash",      costTier: 2, speedTier: 4 },
    balanced: { label: "GPT-5",                 costTier: 5, speedTier: 2 },
    premium:  { label: "GPT-5 (deep reasoning)", costTier: 5, speedTier: 1 },
  },
  salescopy: {
    economy:  { label: "GPT-5 Mini",            costTier: 3, speedTier: 3 },
    balanced: { label: "GPT-5",                 costTier: 5, speedTier: 2 },
    premium:  { label: "GPT-5 (deep reasoning)", costTier: 5, speedTier: 1 },
  },
};

const PREFERENCE_OVERRIDES: Partial<Record<UserPreference, ModelMeta>> = {
  fastest:        { label: "Gemini 2.5 Flash Lite", costTier: 1, speedTier: 5 },
  cheapest:       { label: "Gemini 2.5 Flash Lite", costTier: 1, speedTier: 5 },
  "best-writing": { label: "GPT-5 (deep reasoning)", costTier: 5, speedTier: 1 },
  "best-sales":   { label: "GPT-5 (deep reasoning)", costTier: 5, speedTier: 1 },
};

export function previewModel(
  taskKind: TaskKind,
  qualityMode: QualityMode = "balanced",
  userPreference: UserPreference = "auto",
): ModelMeta {
  if (userPreference !== "auto" && PREFERENCE_OVERRIDES[userPreference]) {
    return PREFERENCE_OVERRIDES[userPreference]!;
  }
  return ROUTING_MATRIX[taskKind][qualityMode];
}

export function costLabel(tier: number): string {
  return ["", "$", "$$", "$$$", "$$$$", "$$$$$"][tier] ?? "$$";
}

export function speedLabel(tier: number): string {
  return ["", "Very Slow", "Slow", "Medium", "Fast", "Very Fast"][tier] ?? "Medium";
}
