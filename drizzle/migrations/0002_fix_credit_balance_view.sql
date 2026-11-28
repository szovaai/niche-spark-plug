CREATE OR REPLACE VIEW public.v_credit_balance
WITH (security_invoker = true)
AS
SELECT
  auth.uid() AS user_id,
  COALESCE((SELECT SUM(delta) FROM public.credit_ledger WHERE user_id = auth.uid()), 0)::int AS balance,
  COALESCE((SELECT SUM(amount) FROM public.credit_reservations
            WHERE user_id = auth.uid() AND status = 'reserved' AND expires_at > now()), 0)::int AS reserved
WHERE auth.uid() IS NOT NULL;
GRANT SELECT ON public.v_credit_balance TO authenticated;