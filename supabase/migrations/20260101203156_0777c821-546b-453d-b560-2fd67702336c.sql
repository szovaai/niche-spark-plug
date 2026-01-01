-- Add columns for guide section builder and save/resume functionality
ALTER TABLE public.toolkits ADD COLUMN IF NOT EXISTS wizard_step INTEGER DEFAULT 0;
ALTER TABLE public.toolkits ADD COLUMN IF NOT EXISTS guide_sections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.toolkits ADD COLUMN IF NOT EXISTS thesis TEXT;
ALTER TABLE public.toolkits ADD COLUMN IF NOT EXISTS writing_style TEXT DEFAULT 'conversational';