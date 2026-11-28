CREATE TABLE public.delivery_packages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id uuid NOT NULL REFERENCES public.business_projects(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL,
 title text NOT NULL,
 file_path text NOT NULL UNIQUE,
 file_name text NOT NULL,
 file_size bigint NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_packages TO authenticated;
GRANT ALL ON public.delivery_packages TO service_role;
ALTER TABLE public.delivery_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_packages_owner_read ON public.delivery_packages FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE INDEX delivery_packages_project_idx ON public.delivery_packages(project_id);
CREATE TABLE public.delivery_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 package_id uuid NOT NULL REFERENCES public.delivery_packages(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL,
 customer_email text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','complimentary','refunded','revoked')),
 provider text CHECK (provider IS NULL OR provider = 'paddle'),
 provider_order_id text UNIQUE,
 amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
 currency text NOT NULL DEFAULT 'USD',
 access_expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_orders TO authenticated;
GRANT ALL ON public.delivery_orders TO service_role;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_orders_owner_read ON public.delivery_orders FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE INDEX delivery_orders_package_idx ON public.delivery_orders(package_id);
CREATE INDEX delivery_orders_customer_idx ON public.delivery_orders(lower(customer_email));
CREATE UNIQUE INDEX delivery_orders_active_comp_idx ON public.delivery_orders(package_id, lower(customer_email)) WHERE status = 'complimentary';
CREATE POLICY delivery_upload_owned_path ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-delivery' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY delivery_remove_unregistered_upload ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-delivery' AND (storage.foldername(name))[1] = auth.uid()::text AND NOT EXISTS (SELECT 1 FROM public.delivery_packages p WHERE p.file_path = name));