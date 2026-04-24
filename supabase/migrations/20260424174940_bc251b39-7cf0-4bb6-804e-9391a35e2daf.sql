-- AI smart model routing preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_quality_mode text NOT NULL DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS ai_model_preference text NOT NULL DEFAULT 'auto';

ALTER TABLE public.toolkits
  ADD COLUMN IF NOT EXISTS ai_quality_mode_override text;

COMMENT ON COLUMN public.profiles.ai_quality_mode IS 'Global default: economy | balanced | premium';
COMMENT ON COLUMN public.profiles.ai_model_preference IS 'auto | fastest | best-writing | best-sales | cheapest';
COMMENT ON COLUMN public.toolkits.ai_quality_mode_override IS 'Per-project override of ai_quality_mode (nullable). economy | balanced | premium';