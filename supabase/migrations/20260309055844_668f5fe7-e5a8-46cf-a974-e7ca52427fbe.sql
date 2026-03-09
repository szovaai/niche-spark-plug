
CREATE OR REPLACE FUNCTION public.increment_genome_uses(genome_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.launch_genomes
  SET uses_count = uses_count + 1, updated_at = now()
  WHERE id = genome_id;
END;
$$;
