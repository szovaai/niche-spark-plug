-- Create toolkits table for the WarriorPlus Toolkit Edition
CREATE TABLE public.toolkits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  niche TEXT NOT NULL,
  target_audience TEXT,
  logo_url TEXT,
  ecover_url TEXT,
  components JSONB DEFAULT '{"guide": true, "worksheet": false, "checklist": false, "resourceList": false, "templates": false, "quiz": false}'::jsonb,
  content JSONB DEFAULT '{}'::jsonb,
  sales_letter TEXT,
  upsell JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.toolkits ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own toolkits" 
ON public.toolkits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own toolkits" 
ON public.toolkits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own toolkits" 
ON public.toolkits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own toolkits" 
ON public.toolkits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_toolkits_updated_at
BEFORE UPDATE ON public.toolkits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();