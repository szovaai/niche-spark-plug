import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptForUser } from './byokCrypto.ts';

export type ApiProvider = 'deepseek' | 'openai' | 'anthropic';

export interface BYOKConfig {
  provider: ApiProvider;
  apiKey: string;
}

/**
 * Fetches user's BYOK API key from their profile.
 * Uses server-side encryption (BYOK_ENCRYPTION_KEY) — legacy client-encrypted
 * keys can no longer be decrypted server-side and will return null so the
 * caller falls back to environment defaults.
 */
export async function getUserApiKey(
  authHeader: string | null,
  preferredProvider: ApiProvider = 'deepseek',
): Promise<BYOKConfig | null> {
  if (!authHeader) return null;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (!profile?.api_keys) return null;

    const apiKeys = profile.api_keys as Record<string, string>;
    const providers: ApiProvider[] = [preferredProvider, 'deepseek', 'openai', 'anthropic'];

    for (const provider of providers) {
      const stored = apiKeys[provider];
      if (!stored) continue;
      const decrypted = await decryptForUser(stored, user.id);
      if (decrypted) return { provider, apiKey: decrypted };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user API key:', error);
    return null;
  }
}

export function getProviderConfig(provider: ApiProvider) {
  switch (provider) {
    case 'openai':
      return { endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' };
    case 'anthropic':
      return {
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307',
        isAnthropic: true,
      };
    case 'deepseek':
    default:
      return { endpoint: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' };
  }
}

export async function makeChatCompletion(
  config: BYOKConfig,
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<{ content: string; provider: ApiProvider }> {
  const providerConfig = getProviderConfig(config.provider);
  const { temperature = 0.7, maxTokens = 2000 } = options;

  if (providerConfig.isAnthropic) {
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');
    const response = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: providerConfig.model,
        max_tokens: maxTokens,
        system: systemMessage,
        messages: userMessages,
      }),
    });
    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
    const data = await response.json();
    return { content: data.content?.[0]?.text || '', provider: config.provider };
  }

  const response = await fetch(providerConfig.endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: providerConfig.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) throw new Error(`${config.provider} API error: ${response.status}`);
  const data = await response.json();
  return { content: data.choices?.[0]?.message?.content || '', provider: config.provider };
}
