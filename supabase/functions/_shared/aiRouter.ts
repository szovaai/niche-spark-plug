/**
 * Smart AI Model Routing for PDF Empire AI
 *
 * Routes a request to the right model based on:
 *   - taskKind:  'fast' | 'longform' | 'salescopy'
 *   - qualityMode: 'economy' | 'balanced' | 'premium'
 *   - userPreference: 'auto' | 'fastest' | 'best-writing' | 'best-sales' | 'cheapest'
 *
 * Includes automatic fallback if a model fails or returns 429/402/5xx.
 */

export type TaskKind = "fast" | "longform" | "salescopy";
export type QualityMode = "economy" | "balanced" | "premium";
export type UserPreference =
  | "auto"
  | "fastest"
  | "best-writing"
  | "best-sales"
  | "cheapest";

export interface RoutedModel {
  model: string;
  reasoning?: { effort: "minimal" | "low" | "medium" | "high" };
  /** Approximate cost rank: 1 = cheapest, 5 = most expensive */
  costTier: 1 | 2 | 3 | 4 | 5;
  /** Approximate speed rank: 1 = slowest, 5 = fastest */
  speedTier: 1 | 2 | 3 | 4 | 5;
}

/**
 * Routing matrix.  Hybrid Balanced mapping (per user choice):
 *   fast      → Gemini 2.5 Flash Lite
 *   longform  → GPT-5  (Premium tier bumps reasoning)
 *   salescopy → GPT-5
 *   fallback  → Gemini 2.5 Flash / Pro
 */
const ROUTING_MATRIX: Record<TaskKind, Record<QualityMode, RoutedModel>> = {
  fast: {
    economy:  { model: "google/gemini-2.5-flash-lite", costTier: 1, speedTier: 5 },
    balanced: { model: "google/gemini-2.5-flash-lite", costTier: 1, speedTier: 5 },
    premium:  { model: "google/gemini-2.5-flash",      costTier: 2, speedTier: 4 },
  },
  longform: {
    economy:  { model: "google/gemini-2.5-flash",      costTier: 2, speedTier: 4 },
    balanced: { model: "openai/gpt-5",                  costTier: 5, speedTier: 2 },
    premium:  { model: "openai/gpt-5", reasoning: { effort: "medium" }, costTier: 5, speedTier: 1 },
  },
  salescopy: {
    economy:  { model: "openai/gpt-5-mini",             costTier: 3, speedTier: 3 },
    balanced: { model: "openai/gpt-5",                  costTier: 5, speedTier: 2 },
    premium:  { model: "openai/gpt-5", reasoning: { effort: "medium" }, costTier: 5, speedTier: 1 },
  },
};

/** Hard user overrides that bypass the matrix entirely. */
const PREFERENCE_OVERRIDES: Partial<Record<UserPreference, RoutedModel>> = {
  fastest:        { model: "google/gemini-2.5-flash-lite", costTier: 1, speedTier: 5 },
  cheapest:       { model: "google/gemini-2.5-flash-lite", costTier: 1, speedTier: 5 },
  "best-writing": { model: "openai/gpt-5", reasoning: { effort: "medium" }, costTier: 5, speedTier: 1 },
  "best-sales":   { model: "openai/gpt-5", reasoning: { effort: "medium" }, costTier: 5, speedTier: 1 },
};

/** Per-task fallback chain (tried in order on failure). */
const FALLBACK_CHAINS: Record<TaskKind, string[]> = {
  fast:      ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "openai/gpt-5-nano"],
  longform:  ["openai/gpt-5", "google/gemini-2.5-pro", "google/gemini-2.5-flash"],
  salescopy: ["openai/gpt-5", "openai/gpt-5-mini", "google/gemini-2.5-pro"],
};

export function pickModel(
  taskKind: TaskKind,
  qualityMode: QualityMode = "balanced",
  userPreference: UserPreference = "auto",
): RoutedModel {
  if (userPreference !== "auto" && PREFERENCE_OVERRIDES[userPreference]) {
    return PREFERENCE_OVERRIDES[userPreference]!;
  }
  return ROUTING_MATRIX[taskKind][qualityMode];
}

export interface CallRoutedAIOptions {
  messages: Array<{ role: string; content: string }>;
  taskKind: TaskKind;
  qualityMode?: QualityMode;
  userPreference?: UserPreference;
  temperature?: number;
  maxTokens?: number;
}

export interface CallRoutedAIResult {
  content: string;
  model: string;
  attempted: string[];
  costTier: number;
  speedTier: number;
}

/**
 * Call the Lovable AI Gateway with smart routing + automatic fallback.
 * If the primary model fails (429/402/5xx/network), tries fallback chain.
 */
export async function callRoutedAI(opts: CallRoutedAIOptions): Promise<CallRoutedAIResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const primary = pickModel(opts.taskKind, opts.qualityMode, opts.userPreference);
  const chain: RoutedModel[] = [
    primary,
    ...FALLBACK_CHAINS[opts.taskKind]
      .filter((m) => m !== primary.model)
      .map((m) => ({ model: m, costTier: 3, speedTier: 3 } as RoutedModel)),
  ];

  const attempted: string[] = [];
  let lastError: unknown = null;

  for (const candidate of chain) {
    attempted.push(candidate.model);
    try {
      const body: Record<string, unknown> = {
        model: candidate.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7,
      };
      if (opts.maxTokens) body.max_tokens = opts.maxTokens;
      if (candidate.reasoning) body.reasoning = candidate.reasoning;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.warn(`[aiRouter] ${candidate.model} failed (${response.status}): ${errText.slice(0, 200)}`);
        // 402 = out of credits — no point trying more models
        if (response.status === 402) {
          throw new Error("Payment required, please add funds to your workspace.");
        }
        lastError = new Error(`${candidate.model}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        lastError = new Error(`${candidate.model}: empty response`);
        continue;
      }

      console.log(`[aiRouter] ✅ ${candidate.model} (task=${opts.taskKind}, mode=${opts.qualityMode ?? "balanced"})`);
      return {
        content,
        model: candidate.model,
        attempted,
        costTier: candidate.costTier,
        speedTier: candidate.speedTier,
      };
    } catch (e) {
      lastError = e;
      console.warn(`[aiRouter] ${candidate.model} threw:`, e);
      continue;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All AI models in fallback chain failed");
}
