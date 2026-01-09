import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Tiered AI Model Selection
 * 
 * Cost optimization strategy:
 * - Free users: Use lighter, faster models (gemini-2.5-flash-lite)
 * - Pro users: Use premium models (gemini-2.5-flash or gemini-2.5-pro)
 */

export type UserTier = 'free' | 'pro';

export interface TieredModelConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
}

/**
 * Get user's tier from their role
 */
export async function getUserTier(userId: string): Promise<UserTier> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('TieredAI: Missing Supabase configuration, defaulting to free tier');
    return 'free';
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.warn('TieredAI: Could not fetch user role, defaulting to free tier');
    return 'free';
  }

  return data.role as UserTier;
}

/**
 * Model configurations by complexity level
 */
const MODEL_CONFIGS = {
  // Simple tasks: classification, short summaries, basic recommendations
  simple: {
    free: { model: 'google/gemini-2.5-flash-lite', temperature: 0.5 },
    pro: { model: 'google/gemini-2.5-flash', temperature: 0.5 },
  },
  // Standard tasks: content generation, analysis, blueprints
  standard: {
    free: { model: 'google/gemini-2.5-flash-lite', temperature: 0.7 },
    pro: { model: 'google/gemini-2.5-flash', temperature: 0.7 },
  },
  // Complex tasks: detailed reports, multi-step reasoning
  complex: {
    free: { model: 'google/gemini-2.5-flash', temperature: 0.7 },
    pro: { model: 'google/gemini-2.5-pro', temperature: 0.7 },
  },
} as const;

export type TaskComplexity = keyof typeof MODEL_CONFIGS;

/**
 * Get the appropriate model config based on user tier and task complexity
 */
export function getModelConfig(
  userTier: UserTier,
  complexity: TaskComplexity = 'standard'
): TieredModelConfig {
  const config = MODEL_CONFIGS[complexity][userTier];
  console.log(`TieredAI: Selected model ${config.model} for ${userTier} user (${complexity} task)`);
  return config;
}

/**
 * Call Lovable AI with tiered model selection
 */
export async function callTieredAI(
  messages: Array<{ role: string; content: string }>,
  userTier: UserTier,
  complexity: TaskComplexity = 'standard'
): Promise<{ content: string; model: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const config = getModelConfig(userTier, complexity);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limits exceeded, please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Payment required, please add funds to your workspace.');
    }
    const errorText = await response.text();
    console.error('AI gateway error:', response.status, errorText);
    throw new Error('AI gateway error');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in AI response');
  }

  return { content, model: config.model };
}
