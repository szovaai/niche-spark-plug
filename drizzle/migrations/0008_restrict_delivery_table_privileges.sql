REVOKE ALL ON public.delivery_packages, public.delivery_orders FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.delivery_packages, public.delivery_orders TO authenticated;
GRANT ALL ON public.delivery_packages, public.delivery_orders TO service_role;