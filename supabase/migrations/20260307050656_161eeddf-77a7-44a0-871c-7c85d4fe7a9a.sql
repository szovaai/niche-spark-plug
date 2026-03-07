
CREATE OR REPLACE FUNCTION public.increment_search_count(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_count integer;
  v_role app_role;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;
  IF v_role = 'pro' THEN
    RETURN jsonb_build_object('success', true, 'unlimited', true);
  END IF;
  PERFORM check_and_reset_daily_limits(p_user_id);
  SELECT searches_today INTO v_current_count FROM profiles WHERE id = p_user_id;
  IF COALESCE(v_current_count, 0) >= 3 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'limit_reached', 'count', v_current_count);
  END IF;
  UPDATE profiles SET searches_today = COALESCE(searches_today, 0) + 1 WHERE id = p_user_id;
  RETURN jsonb_build_object('success', true, 'count', COALESCE(v_current_count, 0) + 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_view_count(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_count integer;
  v_role app_role;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id;
  IF v_role = 'pro' THEN
    RETURN jsonb_build_object('success', true, 'unlimited', true);
  END IF;
  PERFORM check_and_reset_daily_limits(p_user_id);
  SELECT views_today INTO v_current_count FROM profiles WHERE id = p_user_id;
  IF COALESCE(v_current_count, 0) >= 2 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'limit_reached', 'count', v_current_count);
  END IF;
  UPDATE profiles SET views_today = COALESCE(views_today, 0) + 1 WHERE id = p_user_id;
  RETURN jsonb_build_object('success', true, 'count', COALESCE(v_current_count, 0) + 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_reset_daily_limits(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile profiles%ROWTYPE;
  v_should_reset boolean;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('error', 'Unauthorized');
  END IF;
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Profile not found');
  END IF;
  v_should_reset := v_profile.usage_reset_at < now() - interval '24 hours';
  IF v_should_reset THEN
    UPDATE profiles SET searches_today = 0, views_today = 0, usage_reset_at = now() WHERE id = p_user_id;
    RETURN jsonb_build_object('searches_today', 0, 'views_today', 0, 'was_reset', true);
  END IF;
  RETURN jsonb_build_object(
    'searches_today', COALESCE(v_profile.searches_today, 0),
    'views_today', COALESCE(v_profile.views_today, 0),
    'was_reset', false
  );
END;
$function$;
