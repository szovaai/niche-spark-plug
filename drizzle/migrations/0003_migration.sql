-- Paid content: only Pro (or featured / already-tracked) rows are readable
DROP POLICY IF EXISTS "Anyone can read active ugc apps" ON public.ugc_apps;
CREATE POLICY "Featured or Pro ugc apps" ON public.ugc_apps FOR SELECT
USING (
  is_active = true AND (
    is_featured = true
    OR public.has_role(auth.uid(), 'pro')
    OR EXISTS (SELECT 1 FROM public.ugc_user_app_status s WHERE s.app_id = ugc_apps.id AND s.user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Anyone can read quickstart kits" ON public.plr_quickstart_kits;
CREATE POLICY "Free kits or Pro users" ON public.plr_quickstart_kits FOR SELECT
USING (COALESCE(is_pro_only, false) = false OR public.has_role(auth.uid(), 'pro'));

DROP POLICY IF EXISTS "Anyone can read active vault items" ON public.plr_vault_items;
CREATE POLICY "Active free items or Pro users" ON public.plr_vault_items FOR SELECT
USING (is_active = true AND (COALESCE(is_pro_only, false) = false OR public.has_role(auth.uid(), 'pro')));

-- UGC tags: signed-in only
DROP POLICY IF EXISTS "Anyone can read ugc app tags" ON public.ugc_app_tags;
CREATE POLICY "Signed-in users read ugc app tags" ON public.ugc_app_tags FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Anyone can read tag assignments" ON public.ugc_app_tag_assignments;
CREATE POLICY "Signed-in users read tag assignments" ON public.ugc_app_tag_assignments FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.ugc_app_tags, public.ugc_app_tag_assignments FROM anon;

-- Functions: callers may only ask about themselves
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT (_user_id = auth.uid() OR auth.role() = 'service_role')
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_saved_niche_count(_user_id uuid)
 RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT CASE WHEN _user_id = auth.uid() OR auth.role() = 'service_role'
    THEN (SELECT COUNT(*)::INTEGER FROM public.saved_niches WHERE user_id = _user_id)
    ELSE 0 END
$$;

CREATE OR REPLACE FUNCTION public.increment_genome_uses(genome_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.launch_genomes
  SET uses_count = uses_count + 1, updated_at = now()
  WHERE id = genome_id
    AND (is_public = true OR user_id = auth.uid())
    AND user_id IS DISTINCT FROM CASE WHEN is_public THEN auth.uid() ELSE NULL END;
END;
$$;