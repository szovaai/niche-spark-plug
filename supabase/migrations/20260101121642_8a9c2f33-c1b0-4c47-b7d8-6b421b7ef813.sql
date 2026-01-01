-- Add BYOK API keys column to profiles table (stored as JSONB for flexibility)
-- Keys will be encrypted client-side before storage for security
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS api_keys JSONB DEFAULT '{}';

-- Add comment explaining the structure
COMMENT ON COLUMN public.profiles.api_keys IS 'User-provided API keys for BYOK. Structure: {"deepseek": "key", "openai": "key", "anthropic": "key"}';

-- Update RLS policy to ensure only user can read/write their own api_keys
-- The existing policies should already handle this since they check auth.uid() = id