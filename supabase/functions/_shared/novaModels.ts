// Central, configurable Nova model routing.
// Overridable via env vars so we can swap models without editing every function.

const env = (k: string, fallback: string) => Deno.env.get(k) ?? fallback;

export const NOVA_MODELS = {
  coach: env("NOVA_COACH_MODEL", "openai/gpt-5"),
  summary: env("NOVA_SUMMARY_MODEL", "openai/gpt-5-mini"),
  blueprint: env("NOVA_BLUEPRINT_MODEL", "openai/gpt-5"),
  sectionDraft: env("NOVA_DRAFT_MODEL", "openai/gpt-5-mini"),
  cover: env("NOVA_IMAGE_MODEL", "openai/gpt-image-2"),
} as const;

export type NovaTask = keyof typeof NOVA_MODELS;

// Central credit cost table. Chat itself is free — only meaningful AI work costs.
export const NOVA_CREDIT_COSTS = {
  onboarding_chat: 0,
  nova_chat: 0,
  conversation_summary: 0,
  niche_research: 2,
  product_blueprint: 2,
  manuscript_generation: 5,
  cover_generation: 1,
} as const;

export type NovaCreditKind = keyof typeof NOVA_CREDIT_COSTS;
