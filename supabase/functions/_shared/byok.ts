import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type ApiProvider = 'deepseek' | 'openai' | 'anthropic';

export interface BYOKConfig {
  provider: ApiProvider;
  apiKey: string;
}

const SALT = new TextEncoder().encode("digilaunchkit-byok-v1");
const ITERATIONS = 100000;

async function deriveKey(userId: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(userId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function decryptApiKey(stored: string, userId: string): Promise<string> {
  if (!stored) return "";
  if (!stored.startsWith("enc:")) return stored; // legacy plaintext
  const parts = stored.split(":");
  if (parts.length !== 3) return "";
  try {
    const key = await deriveKey(userId);
    const iv = new Uint8Array(base64ToArrayBuffer(parts[1]));
    const ciphertext = base64ToArrayBuffer(parts[2]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch {
    console.error("Failed to decrypt API key");
    return "";
  }
}

/**
 * Fetches user's BYOK API key from their profile.
 * Returns null if no key is configured, falling back to environment variable.
 */
export async function getUserApiKey(
  authHeader: string | null,
  preferredProvider: ApiProvider = 'deepseek'
): Promise<BYOKConfig | null> {
  if (!authHeader) return null;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
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
    
    // Check preferred provider first, then fallbacks
    const providers: ApiProvider[] = [preferredProvider, 'deepseek', 'openai', 'anthropic'];
    
    for (const provider of providers) {
      if (apiKeys[provider]) {
        const decrypted = await decryptApiKey(apiKeys[provider], user.id);
        if (decrypted) {
          return { provider, apiKey: decrypted };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching user API key:', error);
    return null;
  }
}

/**
 * Gets the appropriate API endpoint and model for a provider
 */
export function getProviderConfig(provider: ApiProvider) {
  switch (provider) {
    case 'openai':
      return {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4o-mini',
      };
    case 'anthropic':
      return {
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307',
        isAnthropic: true,
      };
    case 'deepseek':
    default:
      return {
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',
      };
  }
}

/**
 * Makes a chat completion request to any supported provider
 */
export async function makeChatCompletion(
  config: BYOKConfig,
  messages: Array<{ role: string; content: string }>,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<{ content: string; provider: ApiProvider }> {
  const providerConfig = getProviderConfig(config.provider);
  const { temperature = 0.7, maxTokens = 2000 } = options;

  if (providerConfig.isAnthropic) {
    // Anthropic has a different API format
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

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content?.[0]?.text || '',
      provider: config.provider,
    };
  }

  // OpenAI and DeepSeek use the same format
  const response = await fetch(providerConfig.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: providerConfig.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`${config.provider} API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    provider: config.provider,
  };
}
