
-- Launch Genomes: stores successful launch DNA patterns
CREATE TABLE public.launch_genomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.launch_projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'starter',
  price_point NUMERIC DEFAULT 27,
  headline_style TEXT,
  conversion_style TEXT,
  email_style TEXT,
  funnel_layout TEXT,
  bonus_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  genome_data JSONB NOT NULL DEFAULT '{}',
  performance_score INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.launch_genomes ENABLE ROW LEVEL SECURITY;

-- Users can view their own genomes + public genomes
CREATE POLICY "Users can view own genomes" ON public.launch_genomes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own genomes" ON public.launch_genomes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own genomes" ON public.launch_genomes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own genomes" ON public.launch_genomes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
