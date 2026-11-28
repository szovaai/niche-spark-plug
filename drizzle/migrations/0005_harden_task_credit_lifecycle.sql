CREATE OR REPLACE FUNCTION public.reserve_task_credits_for_user(_user_id uuid, _project_id uuid, _task_name text, _assigned_agent text, _cost integer, _input jsonb DEFAULT '{}'::jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_price int; v_balance int; v_reserved int; v_task uuid; v_res uuid;
BEGIN
 IF _user_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','unauthenticated'); END IF;
 v_price := CASE _task_name WHEN 'opportunity_shortlist' THEN 2 WHEN 'validation_report' THEN 2 WHEN 'product_concepts' THEN 2 WHEN 'product_outline' THEN 2 WHEN 'product_section' THEN 1 WHEN 'offer_architecture' THEN 2 WHEN 'payments_plan' THEN 1 WHEN 'content_plan' THEN 2 WHEN 'launch_plan' THEN 2 WHEN 'launch_retro' THEN 2 ELSE NULL END;
 IF v_price IS NULL OR _cost IS DISTINCT FROM v_price THEN RETURN jsonb_build_object('ok',false,'error','invalid_task_price'); END IF;
 IF _project_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.business_projects WHERE id=_project_id AND user_id=_user_id) THEN RETURN jsonb_build_object('ok',false,'error','project_forbidden'); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text, 0));
 SELECT COALESCE(sum(delta),0)::int INTO v_balance FROM public.credit_ledger WHERE user_id=_user_id;
 SELECT COALESCE(sum(amount),0)::int INTO v_reserved FROM public.credit_reservations WHERE user_id=_user_id AND status='reserved' AND expires_at>now();
 IF v_balance-v_reserved<v_price THEN RETURN jsonb_build_object('ok',false,'error','insufficient_credits','available',v_balance-v_reserved,'required',v_price); END IF;
 INSERT INTO public.nova_tasks(user_id,project_id,task_name,assigned_agent,credit_cost,credits_reserved_at,input_json,status) VALUES (_user_id,_project_id,_task_name,_assigned_agent,v_price,now(),_input,'running') RETURNING id INTO v_task;
 INSERT INTO public.credit_reservations(user_id,task_id,amount) VALUES (_user_id,v_task,v_price) RETURNING id INTO v_res;
 RETURN jsonb_build_object('ok',true,'task_id',v_task,'reservation_id',v_res,'balance',v_balance,'available',v_balance-v_reserved-v_price);
END $$;
CREATE OR REPLACE FUNCTION public.finalize_task_credits_for_user(_user_id uuid, _task_id uuid, _output jsonb DEFAULT '{}'::jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.nova_tasks%ROWTYPE; r public.credit_reservations%ROWTYPE; v_balance int;
BEGIN
 IF _user_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','unauthenticated'); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text,0));
 SELECT * INTO t FROM public.nova_tasks WHERE id=_task_id AND user_id=_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','not_found'); END IF;
 IF t.status='completed' AND t.credits_finalized_at IS NOT NULL THEN RETURN jsonb_build_object('ok',true,'already_finalized',true); END IF;
 IF t.status<>'running' THEN RETURN jsonb_build_object('ok',false,'error','invalid_task_state'); END IF;
 SELECT * INTO r FROM public.credit_reservations WHERE task_id=_task_id AND user_id=_user_id AND status='reserved' FOR UPDATE;
 IF NOT FOUND OR r.expires_at<=now() OR r.amount<>t.credit_cost THEN RETURN jsonb_build_object('ok',false,'error','reservation_expired_or_invalid'); END IF;
 SELECT COALESCE(sum(delta),0)::int INTO v_balance FROM public.credit_ledger WHERE user_id=_user_id;
 IF v_balance<t.credit_cost THEN RETURN jsonb_build_object('ok',false,'error','insufficient_credits'); END IF;
 INSERT INTO public.credit_ledger(user_id,delta,reason,task_id,grant_key,balance_after) VALUES (_user_id,-t.credit_cost,'task:'||t.task_name,_task_id,'task_charge:'||_task_id::text,v_balance-t.credit_cost) ON CONFLICT (user_id,grant_key) WHERE grant_key IS NOT NULL DO NOTHING;
 UPDATE public.credit_reservations SET status='finalized' WHERE id=r.id;
 UPDATE public.nova_tasks SET status='completed',output_json=_output,credits_finalized_at=now(),completed_at=now() WHERE id=_task_id;
 RETURN jsonb_build_object('ok',true);
END $$;
CREATE OR REPLACE FUNCTION public.release_task_credits_for_user(_user_id uuid,_task_id uuid,_error text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.nova_tasks%ROWTYPE;
BEGIN
 IF _user_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','unauthenticated'); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user_id::text,0));
 SELECT * INTO t FROM public.nova_tasks WHERE id=_task_id AND user_id=_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','not_found'); END IF;
 IF t.status='completed' THEN RETURN jsonb_build_object('ok',false,'error','already_finalized'); END IF;
 IF t.status='failed' THEN RETURN jsonb_build_object('ok',true,'already_released',true); END IF;
 UPDATE public.credit_reservations SET status='released' WHERE task_id=_task_id AND status='reserved';
 UPDATE public.nova_tasks SET status='failed',error_message=left(_error,2000),completed_at=now() WHERE id=_task_id;
 RETURN jsonb_build_object('ok',true);
END $$;
REVOKE ALL ON FUNCTION public.reserve_task_credits_for_user(uuid,uuid,text,text,integer,jsonb), public.finalize_task_credits_for_user(uuid,uuid,jsonb),public.release_task_credits_for_user(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_task_credits_for_user(uuid,uuid,text,text,integer,jsonb), public.finalize_task_credits_for_user(uuid,uuid,jsonb),public.release_task_credits_for_user(uuid,uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.reserve_task_credits(uuid,text,text,integer,jsonb),public.finalize_task_credits(uuid,jsonb),public.release_task_credits(uuid,text) FROM PUBLIC,anon,authenticated,service_role;
REVOKE INSERT,UPDATE,DELETE ON public.nova_tasks FROM anon,authenticated;
GRANT SELECT ON public.nova_tasks TO authenticated;
GRANT ALL ON public.nova_tasks TO service_role;
COMMENT ON FUNCTION public.reserve_task_credits(uuid,text,text,integer,jsonb) IS 'DEPRECATED: replaced by service-only reserve_task_credits_for_user';
COMMENT ON FUNCTION public.finalize_task_credits(uuid,jsonb) IS 'DEPRECATED: replaced by service-only finalize_task_credits_for_user';
COMMENT ON FUNCTION public.release_task_credits(uuid,text) IS 'DEPRECATED: replaced by service-only release_task_credits_for_user';