
CREATE TABLE public.launch_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.launch_projects(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  visitors integer NOT NULL DEFAULT 0,
  optins integer NOT NULL DEFAULT 0,
  sales integer NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  refunds integer NOT NULL DEFAULT 0,
  upsell_sales integer NOT NULL DEFAULT 0,
  upsell_revenue numeric NOT NULL DEFAULT 0,
  affiliate_clicks integer NOT NULL DEFAULT 0,
  email_opens integer NOT NULL DEFAULT 0,
  email_clicks integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, date)
);

ALTER TABLE public.launch_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics" ON public.launch_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own metrics" ON public.launch_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own metrics" ON public.launch_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own metrics" ON public.launch_metrics FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_launch_metrics_updated_at BEFORE UPDATE ON public.launch_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
