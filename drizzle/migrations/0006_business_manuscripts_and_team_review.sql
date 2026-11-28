CREATE TABLE public.business_members (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, role text NOT NULL DEFAULT 'viewer' CHECK(role='viewer'), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(project_id,user_id));
GRANT SELECT,DELETE ON public.business_members TO authenticated;
GRANT ALL ON public.business_members TO service_role;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY members_read ON public.business_members FOR SELECT TO authenticated USING(user_id=auth.uid() OR EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));
CREATE POLICY owner_remove_member ON public.business_members FOR DELETE TO authenticated USING(EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));
CREATE FUNCTION public.can_view_business(_project_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT auth.uid() IS NOT NULL AND (EXISTS(SELECT 1 FROM public.business_projects WHERE id=_project_id AND user_id=auth.uid()) OR EXISTS(SELECT 1 FROM public.business_members WHERE project_id=_project_id AND user_id=auth.uid())) $$;
REVOKE ALL ON FUNCTION public.can_view_business(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_view_business(uuid) TO authenticated,service_role;
CREATE POLICY team_read_business ON public.business_projects FOR SELECT TO authenticated USING(public.can_view_business(id));
CREATE POLICY team_read_blueprint ON public.business_blueprints FOR SELECT TO authenticated USING(public.can_view_business(project_id));
CREATE TABLE public.business_invitations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE, email text NOT NULL CHECK(email=lower(trim(email)) AND length(email)<=254 AND email LIKE '%@%'), expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days', status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','revoked')), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX business_invitations_project_idx ON public.business_invitations(project_id);
CREATE INDEX business_members_user_idx ON public.business_members(user_id);
GRANT SELECT,INSERT,UPDATE ON public.business_invitations TO authenticated;
GRANT ALL ON public.business_invitations TO service_role;
ALTER TABLE public.business_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_read ON public.business_invitations FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid()) OR (email=lower(auth.jwt()->>'email') AND status='pending' AND expires_at>now()));
CREATE POLICY invitation_create ON public.business_invitations FOR INSERT TO authenticated WITH CHECK(status='pending' AND expires_at>now() AND expires_at<=now()+interval '7 days' AND EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));
CREATE POLICY invitation_revoke ON public.business_invitations FOR UPDATE TO authenticated USING(EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid())) WITH CHECK(status='revoked' AND EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));
CREATE FUNCTION public.accept_business_invitation(_invitation_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv public.business_invitations%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 SELECT * INTO inv FROM public.business_invitations WHERE id=_invitation_id AND status='pending' AND expires_at>now() AND email=lower(auth.jwt()->>'email') FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invitation unavailable'; END IF;
 INSERT INTO public.business_members(project_id,user_id) VALUES(inv.project_id,auth.uid()) ON CONFLICT(project_id,user_id) DO NOTHING;
 UPDATE public.business_invitations SET status='accepted' WHERE id=inv.id;
 RETURN inv.project_id;
END $$;
REVOKE ALL ON FUNCTION public.accept_business_invitation(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.accept_business_invitation(uuid) TO authenticated;
CREATE TABLE public.product_manuscripts (project_id uuid PRIMARY KEY REFERENCES public.business_projects(id) ON DELETE CASCADE, outline jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(outline)='object'), revision uuid NOT NULL DEFAULT gen_random_uuid(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.product_manuscripts TO authenticated;
GRANT ALL ON public.product_manuscripts TO service_role;
ALTER TABLE public.product_manuscripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY manuscript_read ON public.product_manuscripts FOR SELECT TO authenticated USING(public.can_view_business(project_id));
CREATE POLICY manuscript_owner_write ON public.product_manuscripts FOR ALL TO authenticated USING(EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid())) WITH CHECK(EXISTS(SELECT 1 FROM public.business_projects p WHERE p.id=project_id AND p.user_id=auth.uid()));
CREATE FUNCTION public.save_manuscript(_project_id uuid,_outline jsonb,_expected_revision uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE rev uuid:=gen_random_uuid();
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.business_projects WHERE id=_project_id AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Business owner required'; END IF;
 IF jsonb_typeof(_outline)<>'object' OR jsonb_typeof(_outline->'modules')<>'array' OR octet_length(_outline::text)>5000000 THEN RAISE EXCEPTION 'Invalid manuscript'; END IF;
 IF _expected_revision IS NULL THEN
 INSERT INTO public.product_manuscripts(project_id,outline,revision) VALUES(_project_id,_outline,rev) ON CONFLICT(project_id) DO NOTHING;
 ELSE
 UPDATE public.product_manuscripts SET outline=_outline,revision=rev,updated_at=now() WHERE project_id=_project_id AND revision=_expected_revision;
 END IF;
 IF NOT FOUND THEN RAISE EXCEPTION 'Manuscript changed in another tab. Reload before saving.'; END IF;
 RETURN rev;
END $$;
REVOKE ALL ON FUNCTION public.save_manuscript(uuid,jsonb,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_manuscript(uuid,jsonb,uuid) TO authenticated;
