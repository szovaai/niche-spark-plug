CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'product' CHECK (category IN ('product','branding','website','marketing','email','pricing','sensitive')),
  title text NOT NULL,
  summary text,
  requested_by text NOT NULL DEFAULT 'empire',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','changes_requested')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  link_path text,
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX approval_requests_user_status_idx ON public.approval_requests (user_id, status, created_at DESC);
CREATE INDEX approval_requests_project_idx ON public.approval_requests (project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_requests TO authenticated;
GRANT ALL ON public.approval_requests TO service_role;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approval owner all" ON public.approval_requests FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link_path text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications (user_id, read_at, created_at DESC);
CREATE INDEX notifications_project_idx ON public.notifications (project_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications owner all" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.business_projects(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_user_idx ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX audit_logs_project_idx ON public.audit_logs (project_id);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit owner read" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "audit owner insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.log_approval_decision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'pending' THEN
    NEW.decided_at := now();
    INSERT INTO public.audit_logs (user_id, project_id, action, entity_type, entity_id, details)
    VALUES (NEW.user_id, NEW.project_id, 'approval_' || NEW.status, 'approval_request', NEW.id,
            jsonb_build_object('title', NEW.title, 'category', NEW.category, 'note', NEW.decision_note));
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.log_approval_decision() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER approval_requests_decision BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_approval_decision();