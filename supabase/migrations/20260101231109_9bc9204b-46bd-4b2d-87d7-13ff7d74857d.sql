-- Add sales letter style column for persistence
ALTER TABLE public.toolkits 
ADD COLUMN IF NOT EXISTS salesletter_style TEXT DEFAULT 'neutral';