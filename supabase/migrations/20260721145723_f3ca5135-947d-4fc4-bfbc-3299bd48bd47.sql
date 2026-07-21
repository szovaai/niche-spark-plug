
-- Tighten review_comments INSERT policy (was WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can add comments" ON public.review_comments;
CREATE POLICY "Comments require valid session"
  ON public.review_comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    session_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.review_sessions rs WHERE rs.id = session_id)
    AND char_length(coalesce(comment_text, '')) BETWEEN 1 AND 2000
    AND char_length(coalesce(reviewer_name, '')) <= 100
  );

-- Lock down SECURITY DEFINER function execution: revoke default PUBLIC/anon
-- Only re-grant to roles that legitimately need to call each function.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_seed_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clean_expired_cache() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.check_and_reset_daily_limits(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_search_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_genome_uses(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_saved_niche_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reserve_task_credits(uuid, text, text, integer, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.finalize_task_credits(uuid, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.release_task_credits(uuid, text) FROM PUBLIC, anon;

-- increment_page_views is used from the public sales page (anon viewers), keep anon+authenticated.
