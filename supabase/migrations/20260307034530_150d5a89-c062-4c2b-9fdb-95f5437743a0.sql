
CREATE TABLE public.launch_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Launch Project',
  status TEXT NOT NULL DEFAULT 'in_progress',
  niche TEXT,
  target_audience TEXT,
  product_type TEXT,
  topic TEXT,
  step1_product JSONB,
  step2_product_content JSONB,
  step3_funnel JSONB,
  step4_marketing JSONB,
  step5_checklist JSONB,
  current_step INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.launch_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own launch projects"
  ON public.launch_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own launch projects"
  ON public.launch_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own launch projects"
  ON public.launch_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own launch projects"
  ON public.launch_projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_launch_projects_updated_at
  BEFORE UPDATE ON public.launch_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
