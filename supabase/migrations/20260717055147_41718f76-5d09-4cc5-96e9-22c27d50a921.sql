
-- =========================================================================
-- Phase 1: Nova (AI Launch Coach) foundation
-- =========================================================================

-- Founder profiles ---------------------------------------------------------
CREATE TABLE public.founder_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_name text,
  full_name text,
  bio text,
  interests text[],
  skills text[],
  experience text,
  goals text,
  weekly_hours text,
  budget_band text,
  audience text,
  brand_tone text,
  camera_comfort text,
  has_audience text,
  public_urls jsonb NOT NULL DEFAULT '{}'::jsonb,
  research_consent boolean NOT NULL DEFAULT false,
  onboarding_step int NOT NULL DEFAULT 0,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_profiles TO authenticated;
GRANT ALL ON public.founder_profiles TO service_role;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founder_profiles owner all"
  ON public.founder_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Business projects --------------------------------------------------------
CREATE TABLE public.business_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_stage text NOT NULL DEFAULT 'founder_profile',
  selected_niche_id uuid,
  selected_concept_id uuid,
  progress_pct int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_projects TO authenticated;
GRANT ALL ON public.business_projects TO service_role;
ALTER TABLE public.business_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "business_projects owner all"
  ON public.business_projects FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Nova conversations -------------------------------------------------------
CREATE TABLE public.nova_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE CASCADE,
  title text,
  kind text NOT NULL DEFAULT 'coach',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nova_conversations TO authenticated;
GRANT ALL ON public.nova_conversations TO service_role;
ALTER TABLE public.nova_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nova_conversations owner all"
  ON public.nova_conversations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Nova messages (AI SDK UI shape) -----------------------------------------
CREATE TABLE public.nova_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.nova_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id text NOT NULL,
  role text NOT NULL,
  content_text text,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  agent_type text NOT NULL DEFAULT 'nova_manager',
  sequence_no int NOT NULL,
  summarized_at timestamptz,
  summary_memory_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, message_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nova_messages TO authenticated;
GRANT ALL ON public.nova_messages TO service_role;
ALTER TABLE public.nova_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nova_messages owner all"
  ON public.nova_messages FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_nova_messages_conv_seq ON public.nova_messages(conversation_id, sequence_no);
CREATE INDEX idx_nova_messages_conv_active ON public.nova_messages(conversation_id) WHERE summarized_at IS NULL;

-- Nova memories ------------------------------------------------------------
CREATE TABLE public.nova_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE CASCADE,
  memory_type text NOT NULL CHECK (memory_type IN ('decision','preference','open_question','coach_note','summary','profile')),
  content text NOT NULL,
  importance int NOT NULL DEFAULT 5,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nova_memories TO authenticated;
GRANT ALL ON public.nova_memories TO service_role;
ALTER TABLE public.nova_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nova_memories owner all"
  ON public.nova_memories FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_nova_memories_user_project ON public.nova_memories(user_id, project_id, memory_type);

-- Nova tasks ---------------------------------------------------------------
CREATE TABLE public.nova_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  assigned_agent text,
  credit_cost int NOT NULL DEFAULT 0,
  credits_reserved_at timestamptz,
  credits_finalized_at timestamptz,
  input_json jsonb,
  output_json jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nova_tasks TO authenticated;
GRANT ALL ON public.nova_tasks TO service_role;
ALTER TABLE public.nova_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nova_tasks owner all"
  ON public.nova_tasks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Credit ledger (append-only; SECURITY DEFINER functions only) ------------
CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta int NOT NULL,
  reason text NOT NULL,
  grant_key text,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE SET NULL,
  task_id uuid,
  balance_after int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_credit_ledger_grant_key
  ON public.credit_ledger(user_id, grant_key)
  WHERE grant_key IS NOT NULL;
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_ledger owner read"
  ON public.credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- Credit reservations ------------------------------------------------------
CREATE TABLE public.credit_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.nova_tasks(id) ON DELETE CASCADE,
  amount int NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','finalized','released')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_reservations TO authenticated;
GRANT ALL ON public.credit_reservations TO service_role;
ALTER TABLE public.credit_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_reservations owner read"
  ON public.credit_reservations FOR SELECT
  USING (auth.uid() = user_id);

-- Balance view -------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_credit_balance
WITH (security_invoker = true)
AS
SELECT
  u.id AS user_id,
  COALESCE((SELECT SUM(delta) FROM public.credit_ledger WHERE user_id = u.id), 0)::int AS balance,
  COALESCE((SELECT SUM(amount) FROM public.credit_reservations
            WHERE user_id = u.id AND status = 'reserved' AND expires_at > now()), 0)::int AS reserved
FROM auth.users u;
GRANT SELECT ON public.v_credit_balance TO authenticated;

-- Idempotent seed grant ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_seed_credits(_user_id uuid, _amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current int;
BEGIN
  SELECT COALESCE(SUM(delta), 0)::int INTO v_current
  FROM public.credit_ledger WHERE user_id = _user_id;

  INSERT INTO public.credit_ledger (user_id, delta, reason, grant_key, balance_after)
  VALUES (_user_id, _amount, 'phase1_signup_seed', 'phase1_signup_seed', v_current + _amount)
  ON CONFLICT (user_id, grant_key) WHERE grant_key IS NOT NULL DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_seed_credits(uuid, int) FROM PUBLIC, anon, authenticated;

-- Reserve credits (atomic; runs before AI call outside any tx) ------------
CREATE OR REPLACE FUNCTION public.reserve_task_credits(
  _project_id uuid,
  _task_name text,
  _assigned_agent text,
  _cost int,
  _input jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance int;
  v_reserved int;
  v_available int;
  v_task_id uuid;
  v_reservation_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF _cost < 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_cost');
  END IF;

  IF _project_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.business_projects WHERE id = _project_id AND user_id = v_user) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'project_forbidden');
    END IF;
  END IF;

  SELECT COALESCE(SUM(delta), 0)::int INTO v_balance
  FROM public.credit_ledger WHERE user_id = v_user;

  SELECT COALESCE(SUM(amount), 0)::int INTO v_reserved
  FROM public.credit_reservations
  WHERE user_id = v_user AND status = 'reserved' AND expires_at > now();

  v_available := v_balance - v_reserved;

  IF _cost > 0 AND v_available < _cost THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'insufficient_credits',
      'balance', v_balance,
      'available', v_available,
      'required', _cost
    );
  END IF;

  INSERT INTO public.nova_tasks
    (user_id, project_id, task_name, assigned_agent, credit_cost, credits_reserved_at, input_json, status)
  VALUES
    (v_user, _project_id, _task_name, _assigned_agent, _cost, now(), _input, 'running')
  RETURNING id INTO v_task_id;

  IF _cost > 0 THEN
    INSERT INTO public.credit_reservations (user_id, task_id, amount)
    VALUES (v_user, v_task_id, _cost)
    RETURNING id INTO v_reservation_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'task_id', v_task_id,
    'reservation_id', v_reservation_id,
    'balance', v_balance,
    'available', v_available - _cost
  );
END;
$$;

-- Finalize (charge) credits after a successful AI task --------------------
CREATE OR REPLACE FUNCTION public.finalize_task_credits(
  _task_id uuid,
  _output jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_task_user uuid;
  v_amount int;
  v_task_name text;
  v_current int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT user_id, credit_cost, task_name
    INTO v_task_user, v_amount, v_task_name
    FROM public.nova_tasks WHERE id = _task_id;

  IF v_task_user IS NULL OR v_task_user <> v_user THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  UPDATE public.credit_reservations
    SET status = 'finalized'
    WHERE task_id = _task_id AND status = 'reserved';

  IF v_amount > 0 THEN
    SELECT COALESCE(SUM(delta), 0)::int INTO v_current
      FROM public.credit_ledger WHERE user_id = v_user;
    INSERT INTO public.credit_ledger (user_id, delta, reason, task_id, balance_after)
    VALUES (v_user, -v_amount, 'task:' || v_task_name, _task_id, v_current - v_amount);
  END IF;

  UPDATE public.nova_tasks
    SET status = 'completed',
        output_json = _output,
        credits_finalized_at = now(),
        completed_at = now()
    WHERE id = _task_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Release (refund) credits when a task fails or is aborted ---------------
CREATE OR REPLACE FUNCTION public.release_task_credits(
  _task_id uuid,
  _error text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_task_user uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT user_id INTO v_task_user FROM public.nova_tasks WHERE id = _task_id;
  IF v_task_user IS NULL OR v_task_user <> v_user THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  UPDATE public.credit_reservations
    SET status = 'released'
    WHERE task_id = _task_id AND status = 'reserved';

  UPDATE public.nova_tasks
    SET status = 'failed',
        error_message = _error,
        completed_at = now()
    WHERE id = _task_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Signup trigger update: also grant seed credits idempotently ------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'free')
  ON CONFLICT DO NOTHING;

  PERFORM public.grant_seed_credits(new.id, 25);

  RETURN new;
END;
$$;

-- updated_at triggers ----------------------------------------------------
CREATE TRIGGER founder_profiles_touch
  BEFORE UPDATE ON public.founder_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER business_projects_touch
  BEFORE UPDATE ON public.business_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER nova_conversations_touch
  BEFORE UPDATE ON public.nova_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER nova_memories_touch
  BEFORE UPDATE ON public.nova_memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill 25 seed credits for existing users (idempotent) ---------------
DO $$
DECLARE u record;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    PERFORM public.grant_seed_credits(u.id, 25);
  END LOOP;
END $$;
