-- Add notes column to saved_niches table
ALTER TABLE public.saved_niches 
ADD COLUMN notes text;