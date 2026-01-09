-- Create AI cache table for storing AI responses
CREATE TABLE public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  function_name text NOT NULL,
  input_hash text NOT NULL,
  response jsonb NOT NULL,
  user_tier text NOT NULL DEFAULT 'free',
  model_used text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  hit_count integer NOT NULL DEFAULT 0
);

-- Create index for fast lookups
CREATE INDEX idx_ai_cache_lookup ON public.ai_cache(cache_key, expires_at);
CREATE INDEX idx_ai_cache_function ON public.ai_cache(function_name);

-- Enable RLS
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached responses (public cache)
CREATE POLICY "Anyone can read cached responses"
ON public.ai_cache
FOR SELECT
USING (expires_at > now());

-- Only backend functions can insert/update (via service role)
-- No user INSERT/UPDATE/DELETE policies needed since this is managed by edge functions

-- Create function to clean expired cache entries (can be called periodically)
CREATE OR REPLACE FUNCTION public.clean_expired_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.ai_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create pre-generated recommendations table for batch processing
CREATE TABLE public.pregenerated_niches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_category text NOT NULL,
  niche_name text NOT NULL,
  recommendation_data jsonb NOT NULL,
  popularity_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for category lookups
CREATE INDEX idx_pregenerated_niches_category ON public.pregenerated_niches(niche_category);
CREATE INDEX idx_pregenerated_niches_popularity ON public.pregenerated_niches(popularity_score DESC);

-- Enable RLS
ALTER TABLE public.pregenerated_niches ENABLE ROW LEVEL SECURITY;

-- Anyone can read pre-generated data
CREATE POLICY "Anyone can read pregenerated niches"
ON public.pregenerated_niches
FOR SELECT
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_pregenerated_niches_updated_at
BEFORE UPDATE ON public.pregenerated_niches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();