-- Create niche_blueprint_usage table for tracking blueprint uniqueness
CREATE TABLE public.niche_blueprint_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  niche_id TEXT NOT NULL,
  niche_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  transformation_focus TEXT NOT NULL,
  style_vibe TEXT NOT NULL,
  price_tier TEXT NOT NULL,
  blueprint_hash TEXT NOT NULL,
  product_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_niche_blueprint_usage_niche ON public.niche_blueprint_usage(niche_id);
CREATE INDEX idx_niche_blueprint_usage_hash ON public.niche_blueprint_usage(blueprint_hash);
CREATE INDEX idx_niche_blueprint_usage_user ON public.niche_blueprint_usage(user_id);

-- Enable Row Level Security
ALTER TABLE public.niche_blueprint_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own blueprint usage
CREATE POLICY "Users can view their own blueprint usage"
ON public.niche_blueprint_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own blueprint usage
CREATE POLICY "Users can insert their own blueprint usage"
ON public.niche_blueprint_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to count blueprints for a niche
CREATE OR REPLACE FUNCTION public.get_niche_blueprint_count(p_niche_id TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.niche_blueprint_usage
  WHERE niche_id = p_niche_id
$$;

-- Create function to check blueprint uniqueness
CREATE OR REPLACE FUNCTION public.check_blueprint_uniqueness(
  p_niche_id TEXT,
  p_target_audience TEXT,
  p_transformation_focus TEXT,
  p_style_vibe TEXT
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.niche_blueprint_usage
  WHERE niche_id = p_niche_id
    AND target_audience = p_target_audience
    AND transformation_focus = p_transformation_focus
    AND style_vibe = p_style_vibe
$$;