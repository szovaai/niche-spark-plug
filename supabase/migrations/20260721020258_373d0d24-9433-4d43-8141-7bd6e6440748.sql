
-- Extend business_projects
ALTER TABLE public.business_projects
  ADD COLUMN IF NOT EXISTS current_mission_id text DEFAULT 'm0',
  ADD COLUMN IF NOT EXISTS overall_progress_pct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_pct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_action jsonb;

-- business_blueprints
CREATE TABLE IF NOT EXISTS public.business_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.business_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  business_name text,
  niche text,
  target_audience text,
  customer_problem text,
  desired_outcome text,
  product_concept text,
  product_promise text,
  offer_summary text,
  price numeric,
  bonuses jsonb DEFAULT '[]'::jsonb,
  order_bump text,
  upsell text,
  downsell text,
  funnel_platform text,
  payment_provider text,
  traffic_source text,
  brand_voice text,
  brand_colors jsonb DEFAULT '[]'::jsonb,
  launch_date date,
  revenue_goal numeric,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_blueprints TO authenticated;
GRANT ALL ON public.business_blueprints TO service_role;
ALTER TABLE public.business_blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blueprints" ON public.business_blueprints
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER blueprints_updated BEFORE UPDATE ON public.business_blueprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- mission_progress
CREATE TABLE IF NOT EXISTS public.mission_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  mission_id text NOT NULL,
  status text NOT NULL DEFAULT 'locked',
  progress_pct integer NOT NULL DEFAULT 0,
  blockers jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, mission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_progress TO authenticated;
GRANT ALL ON public.mission_progress TO service_role;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission progress" ON public.mission_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER mission_progress_updated BEFORE UPDATE ON public.mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- mission_tasks
CREATE TABLE IF NOT EXISTS public.mission_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  mission_id text NOT NULL,
  task_key text NOT NULL,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  output_ref text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, mission_id, task_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_tasks TO authenticated;
GRANT ALL ON public.mission_tasks TO service_role;
ALTER TABLE public.mission_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission tasks" ON public.mission_tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER mission_tasks_updated BEFORE UPDATE ON public.mission_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_decisions
CREATE TABLE IF NOT EXISTS public.user_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  mission_id text,
  decision_key text NOT NULL,
  value jsonb NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_decisions TO authenticated;
GRANT ALL ON public.user_decisions TO service_role;
ALTER TABLE public.user_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own decisions" ON public.user_decisions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- launch_milestones
CREATE TABLE IF NOT EXISTS public.launch_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  achieved_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.launch_milestones TO authenticated;
GRANT ALL ON public.launch_milestones TO service_role;
ALTER TABLE public.launch_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own milestones" ON public.launch_milestones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
