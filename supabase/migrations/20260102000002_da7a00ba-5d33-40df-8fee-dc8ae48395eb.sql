-- Add salesletter_html column for portable HTML export
ALTER TABLE public.toolkits ADD COLUMN IF NOT EXISTS salesletter_html TEXT;