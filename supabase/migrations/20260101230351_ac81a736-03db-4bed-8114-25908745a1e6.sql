-- Add columns for sales letter 2-step workflow state persistence
ALTER TABLE public.toolkits 
ADD COLUMN IF NOT EXISTS sales_offer_details jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesletter_raw text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesletter_polished text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS salesletter_step text DEFAULT 'input';