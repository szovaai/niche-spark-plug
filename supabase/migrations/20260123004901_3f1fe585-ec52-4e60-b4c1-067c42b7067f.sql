-- Create empire_projects table for AI Digital Product Empire Mode
CREATE TABLE public.empire_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Empire Project',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'complete')),
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Step 1: Niche Finder
  step1_niches_input JSONB,
  step1_niche_analysis JSONB,
  step1_final_niche TEXT,
  
  -- Step 2: Brand Setup
  step2_brand_options JSONB,
  step2_selected_brand TEXT,
  step2_logo_prompts JSONB,
  step2_social_bios JSONB,
  step2_warming_checklist JSONB,
  
  -- Step 3: Product Pack
  step3_product_brief JSONB,
  step3_selected_product TEXT,
  step3_price_range TEXT,
  step3_sheet_schema JSONB,
  step3_manual_text TEXT,
  
  -- Step 4: Gumroad Launch
  step4_listing_copy JSONB,
  step4_visual_prompts JSONB,
  step4_delivery_instructions TEXT,
  step4_domain_ideas JSONB,
  
  -- Step 5: Content Engine
  step5_content_patterns JSONB,
  step5_viral_ideas JSONB,
  step5_scripts JSONB,
  step5_content_calendar JSONB,
  
  -- Step 6: Automation
  step6_schedule_plan JSONB,
  step6_engagement_checklist JSONB,
  step6_ad_angles JSONB
);

-- Enable RLS
ALTER TABLE public.empire_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own empire projects"
ON public.empire_projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own empire projects"
ON public.empire_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own empire projects"
ON public.empire_projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own empire projects"
ON public.empire_projects FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_empire_projects_updated_at
BEFORE UPDATE ON public.empire_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for user lookups
CREATE INDEX idx_empire_projects_user_id ON public.empire_projects(user_id);
CREATE INDEX idx_empire_projects_status ON public.empire_projects(status);