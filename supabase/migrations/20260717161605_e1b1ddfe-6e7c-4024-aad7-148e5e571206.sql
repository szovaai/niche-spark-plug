CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('origin_story','insight','launch','value','welcome','reengagement')),
  email_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  body_html TEXT,
  body_text TEXT,
  cta TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  repurposed_content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_campaigns_user ON public.email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_project ON public.email_campaigns(project_id);
CREATE INDEX idx_email_campaigns_type ON public.email_campaigns(campaign_type);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own email campaigns"
  ON public.email_campaigns FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();