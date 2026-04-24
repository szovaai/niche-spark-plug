ALTER TABLE public.toolkits 
  ADD COLUMN IF NOT EXISTS content_depth text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS primary_voice text,
  ADD COLUMN IF NOT EXISTS secondary_voice text,
  ADD COLUMN IF NOT EXISTS blend_ratio text DEFAULT '70/30',
  ADD COLUMN IF NOT EXISTS boost_score jsonb;