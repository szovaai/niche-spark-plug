
-- Launch Intelligence table: stores Product DNA + performance feedback
CREATE TABLE public.launch_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.launch_projects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Product DNA
  niche text,
  topic text,
  target_audience text,
  product_type text,
  price_point numeric DEFAULT 17,
  mechanism_name text,
  headline_style text,
  sales_style text,
  email_sequence_type text,
  offer_structure jsonb DEFAULT '{}'::jsonb,
  bonus_count integer DEFAULT 0,
  hooks_used jsonb DEFAULT '[]'::jsonb,
  copy_tone text,
  platform text DEFAULT 'warriorplus',
  
  -- Performance Feedback
  performance_rating text DEFAULT 'not_rated', -- not_rated, poor, average, good, excellent
  sales_count integer,
  click_through_rate numeric,
  email_open_rate numeric,
  affiliate_interest text, -- none, low, medium, high
  social_engagement text, -- none, low, medium, high
  notes text,
  
  -- Blueprint matching
  blueprint_tags text[] DEFAULT '{}'::text[]
);

ALTER TABLE public.launch_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intelligence data"
  ON public.launch_intelligence FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intelligence data"
  ON public.launch_intelligence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intelligence data"
  ON public.launch_intelligence FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intelligence data"
  ON public.launch_intelligence FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_launch_intelligence_updated_at
  BEFORE UPDATE ON public.launch_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
