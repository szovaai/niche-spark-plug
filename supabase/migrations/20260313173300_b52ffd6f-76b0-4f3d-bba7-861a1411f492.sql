-- Feature 5: Version History
CREATE TABLE public.project_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  version_number integer NOT NULL DEFAULT 1,
  step_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  label text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own versions" ON public.project_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own versions" ON public.project_versions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own versions" ON public.project_versions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own versions" ON public.project_versions FOR UPDATE USING (auth.uid() = user_id);

-- Feature 6: Collaborative Review
CREATE TABLE public.review_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.launch_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  share_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON public.review_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read by token" ON public.review_sessions FOR SELECT USING (true);

CREATE TABLE public.review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.review_sessions(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  comment_text text NOT NULL,
  reviewer_name text NOT NULL DEFAULT 'Anonymous',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.review_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can add comments" ON public.review_comments FOR INSERT WITH CHECK (true);

-- Feature 2: Smart Templates
CREATE TABLE public.launch_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  preview_image text,
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  uses_count integer NOT NULL DEFAULT 0,
  rating numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.launch_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active templates" ON public.launch_templates FOR SELECT USING (is_active = true);