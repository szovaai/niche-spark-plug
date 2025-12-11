-- Create ugc_apps table for the UGC App directory
CREATE TABLE public.ugc_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  short_tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT[] NOT NULL,
  content_types TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  primary_audience TEXT,
  countries_supported TEXT[] DEFAULT '{"GLOBAL"}',
  followers_required TEXT DEFAULT 'NONE',
  pay_model TEXT[] NOT NULL,
  typical_pay_min DECIMAL DEFAULT 0,
  typical_pay_max DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  beginner_friendly_score INTEGER DEFAULT 3,
  earning_potential_score INTEGER DEFAULT 3,
  consistency_score INTEGER DEFAULT 3,
  risk_notes TEXT,
  signup_url_web TEXT,
  signup_url_ios TEXT,
  signup_url_android TEXT,
  official_site_url TEXT,
  referral_program BOOLEAN DEFAULT FALSE,
  referral_notes TEXT,
  how_it_works TEXT[],
  pros TEXT[],
  cons TEXT[],
  tips TEXT[],
  notes_for_creators TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_pro_only BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ugc_app_tags table
CREATE TABLE public.ugc_app_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  tag_group TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ugc_app_tag_assignments table
CREATE TABLE public.ugc_app_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES public.ugc_apps(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.ugc_app_tags(id) ON DELETE CASCADE,
  UNIQUE(app_id, tag_id)
);

-- Create ugc_user_app_status table for user tracking
CREATE TABLE public.ugc_user_app_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id UUID REFERENCES public.ugc_apps(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'BOOKMARKED',
  notes TEXT,
  estimated_monthly DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Enable RLS on all tables
ALTER TABLE public.ugc_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_app_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_app_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc_user_app_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for ugc_apps (anyone can read active apps)
CREATE POLICY "Anyone can read active ugc apps"
ON public.ugc_apps
FOR SELECT
USING (is_active = true);

-- RLS policies for ugc_app_tags (anyone can read)
CREATE POLICY "Anyone can read ugc app tags"
ON public.ugc_app_tags
FOR SELECT
USING (true);

-- RLS policies for ugc_app_tag_assignments (anyone can read)
CREATE POLICY "Anyone can read tag assignments"
ON public.ugc_app_tag_assignments
FOR SELECT
USING (true);

-- RLS policies for ugc_user_app_status (users can CRUD their own)
CREATE POLICY "Users can view their own app statuses"
ON public.ugc_user_app_status
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own app statuses"
ON public.ugc_user_app_status
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app statuses"
ON public.ugc_user_app_status
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own app statuses"
ON public.ugc_user_app_status
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on ugc_user_app_status
CREATE TRIGGER update_ugc_user_app_status_updated_at
BEFORE UPDATE ON public.ugc_user_app_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();