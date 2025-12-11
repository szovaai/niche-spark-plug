-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user_product_builds table to store complete product packages
CREATE TABLE public.user_product_builds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  niche_id TEXT NOT NULL,
  niche_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  
  -- Personalization data
  target_audience TEXT NOT NULL,
  transformation_focus TEXT NOT NULL,
  style_vibe TEXT NOT NULL,
  price_tier TEXT NOT NULL,
  
  -- Generated content (stored as JSONB)
  blueprint JSONB NOT NULL,
  bundles JSONB,
  launch_kit JSONB,
  ecovers JSONB,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'in_progress',
  completion_steps JSONB DEFAULT '{"blueprint": true, "ecovers": false, "bundles": false, "launchKit": false}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_product_builds ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own product builds" 
ON public.user_product_builds 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product builds" 
ON public.user_product_builds 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product builds" 
ON public.user_product_builds 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product builds" 
ON public.user_product_builds 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_product_builds_updated_at
BEFORE UPDATE ON public.user_product_builds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();