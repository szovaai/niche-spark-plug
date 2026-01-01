-- Create launch_progress table
CREATE TABLE public.launch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toolkit_id UUID NOT NULL REFERENCES public.toolkits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_platform TEXT,
  completed_steps TEXT[] DEFAULT '{}',
  live_url TEXT,
  first_sale_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(toolkit_id, user_id)
);

-- Enable RLS
ALTER TABLE public.launch_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own launch progress"
ON public.launch_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own launch progress"
ON public.launch_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own launch progress"
ON public.launch_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own launch progress"
ON public.launch_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_launch_progress_updated_at
BEFORE UPDATE ON public.launch_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();