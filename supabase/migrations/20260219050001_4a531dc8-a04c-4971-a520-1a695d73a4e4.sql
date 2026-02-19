
-- Create micro_products table
CREATE TABLE public.micro_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL,
  niche_topic TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_content JSONB,
  product_title TEXT,
  product_subtitle TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.micro_products ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own micro products"
ON public.micro_products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own micro products"
ON public.micro_products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own micro products"
ON public.micro_products FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own micro products"
ON public.micro_products FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_micro_products_updated_at
BEFORE UPDATE ON public.micro_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
