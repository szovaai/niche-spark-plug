-- opportunities (cached AI-generated buyer pains)
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  mode text NOT NULL DEFAULT 'buyer_problems',
  title text NOT NULL,
  niche text,
  score int NOT NULL,
  demand int,
  pain int,
  competition int,
  emotion int,
  ad_potential int,
  upsell int,
  hooks jsonb DEFAULT '[]'::jsonb,
  suggested_price numeric,
  platform text,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads opportunities"
  ON public.opportunities FOR SELECT
  USING (true);

CREATE INDEX idx_opportunities_keyword_mode ON public.opportunities(keyword, mode);
CREATE INDEX idx_opportunities_created_at ON public.opportunities(created_at DESC);

-- saved_opportunities (user bookmarks → projects bridge)
CREATE TABLE public.saved_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'idea',
  project_id uuid REFERENCES public.launch_projects(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own saved opportunities"
  ON public.saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved opportunities"
  ON public.saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saved opportunities"
  ON public.saved_opportunities FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own saved opportunities"
  ON public.saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_opportunities_user ON public.saved_opportunities(user_id);

-- launch_projects: lifecycle status
ALTER TABLE public.launch_projects
  ADD COLUMN IF NOT EXISTS lifecycle_status text DEFAULT 'idea';