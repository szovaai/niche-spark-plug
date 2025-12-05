-- Add usage tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS searches_today integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_today integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_at timestamp with time zone DEFAULT now();

-- Create launch_packs table for pre-curated Done-For-You packs
CREATE TABLE public.launch_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  niche_name text NOT NULL,
  category text NOT NULL,
  why_hot text NOT NULL,
  plr_suggestion jsonb NOT NULL,
  listing_title text NOT NULL,
  listing_bullets text[] NOT NULL,
  image_recommendations text[] NOT NULL,
  promo_idea text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on launch_packs
ALTER TABLE public.launch_packs ENABLE ROW LEVEL SECURITY;

-- Pro users can view launch packs
CREATE POLICY "Pro users can view launch packs"
ON public.launch_packs
FOR SELECT
USING (
  public.has_role(auth.uid(), 'pro')
);

-- Create function to check and reset daily limits
CREATE OR REPLACE FUNCTION public.check_and_reset_daily_limits(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
  v_should_reset boolean;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  
  -- Check if we need to reset (more than 24 hours since last reset)
  v_should_reset := v_profile.usage_reset_at < now() - interval '24 hours';
  
  IF v_should_reset THEN
    UPDATE profiles 
    SET searches_today = 0, 
        views_today = 0, 
        usage_reset_at = now()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
      'searches_today', 0,
      'views_today', 0,
      'was_reset', true
    );
  END IF;
  
  RETURN jsonb_build_object(
    'searches_today', COALESCE(v_profile.searches_today, 0),
    'views_today', COALESCE(v_profile.views_today, 0),
    'was_reset', false
  );
END;
$$;

-- Create function to increment search count
CREATE OR REPLACE FUNCTION public.increment_search_count(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_role app_role;
BEGIN
  -- Check role
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;
  
  -- Pro users don't have limits
  IF v_role = 'pro' THEN
    RETURN jsonb_build_object('success', true, 'unlimited', true);
  END IF;
  
  -- Get current count (after potential reset)
  PERFORM check_and_reset_daily_limits(p_user_id);
  SELECT searches_today INTO v_current_count FROM profiles WHERE id = p_user_id;
  
  -- Check limit (3 for free)
  IF COALESCE(v_current_count, 0) >= 3 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'limit_reached', 'count', v_current_count);
  END IF;
  
  -- Increment
  UPDATE profiles SET searches_today = COALESCE(searches_today, 0) + 1 WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'count', COALESCE(v_current_count, 0) + 1);
END;
$$;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_role app_role;
BEGIN
  -- Check role
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;
  
  -- Pro users don't have limits
  IF v_role = 'pro' THEN
    RETURN jsonb_build_object('success', true, 'unlimited', true);
  END IF;
  
  -- Get current count (after potential reset)
  PERFORM check_and_reset_daily_limits(p_user_id);
  SELECT views_today INTO v_current_count FROM profiles WHERE id = p_user_id;
  
  -- Check limit (2 for free)
  IF COALESCE(v_current_count, 0) >= 2 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'limit_reached', 'count', v_current_count);
  END IF;
  
  -- Increment
  UPDATE profiles SET views_today = COALESCE(views_today, 0) + 1 WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'count', COALESCE(v_current_count, 0) + 1);
END;
$$;