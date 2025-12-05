-- Add onboarding and preference columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_platform text DEFAULT null,
ADD COLUMN IF NOT EXISTS product_interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tooltips_seen text[] DEFAULT '{}';

-- Create daily_inspiration table
CREATE TABLE IF NOT EXISTS public.daily_inspiration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  niche_link TEXT,
  category TEXT DEFAULT 'tip',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_inspiration ENABLE ROW LEVEL SECURITY;

-- Everyone can read inspirations
CREATE POLICY "Anyone can read inspirations" 
ON public.daily_inspiration 
FOR SELECT 
USING (true);

-- Insert some initial inspirations
INSERT INTO public.daily_inspiration (title, content, niche_link, category) VALUES
('AI Coloring Pages Surge', 'AI-generated coloring pages saw a 340% increase in Etsy sales last month. Low competition + high demand = perfect launch opportunity!', 'ai-coloring-pages', 'success'),
('Quick Win: Meal Planners', 'Meal planners consistently rank in the top 10 digital products. They''re easy to create and have year-round demand.', 'meal-planners', 'tip'),
('Pro Tip: Bundle Products', 'Sellers who bundle 3-5 related products see 2x higher conversion rates than single-product listings.', null, 'tip'),
('Trending: Digital Journals', 'Digital bullet journals are up 180% this quarter. GoodNotes and Notability users are hungry for new designs!', 'digital-journals', 'trend'),
('Success Story', 'Sarah launched her first budget planner using DigiStream''s Build Pack feature and made $847 in her first week!', 'budget-templates', 'success');