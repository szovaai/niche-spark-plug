import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * AI Cache Helper - Reduces cloud costs by caching AI responses
 */

interface CacheEntry {
  response: unknown;
  model_used: string;
  hit_count: number;
}

/**
 * Generate a cache key from function name and input
 */
export function generateCacheKey(functionName: string, input: unknown): string {
  const inputStr = JSON.stringify(input);
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${functionName}:${Math.abs(hash).toString(36)}`;
}

/**
 * Get cached response if available and not expired
 */
export async function getCachedResponse(
  cacheKey: string
): Promise<CacheEntry | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Cache: Missing Supabase configuration');
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from('ai_cache')
    .select('response, model_used, hit_count')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  // Increment hit count (fire and forget)
  supabase
    .from('ai_cache')
    .update({ hit_count: data.hit_count + 1 })
    .eq('cache_key', cacheKey)
    .then(() => console.log('Cache hit count updated'));

  console.log(`Cache HIT for key: ${cacheKey}`);
  return data;
}

/**
 * Store AI response in cache
 */
export async function setCachedResponse(
  cacheKey: string,
  functionName: string,
  inputHash: string,
  response: unknown,
  userTier: string,
  modelUsed: string,
  ttlHours: number = 24
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Cache: Missing Supabase configuration');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  const { error } = await supabase
    .from('ai_cache')
    .upsert({
      cache_key: cacheKey,
      function_name: functionName,
      input_hash: inputHash,
      response,
      user_tier: userTier,
      model_used: modelUsed,
      expires_at: expiresAt.toISOString(),
      hit_count: 0,
    }, {
      onConflict: 'cache_key'
    });

  if (error) {
    console.error('Cache: Failed to store response:', error.message);
  } else {
    console.log(`Cache SET for key: ${cacheKey}, expires: ${expiresAt.toISOString()}`);
  }
}
