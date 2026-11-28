DROP POLICY IF EXISTS "Anyone can read by token" ON public.review_sessions;
DROP POLICY IF EXISTS "Anyone can read comments" ON public.review_comments;
CREATE POLICY "Owners read comments on own sessions" ON public.review_comments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.review_sessions rs WHERE rs.id = session_id AND rs.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS review_comments_session_idx ON public.review_comments (session_id);