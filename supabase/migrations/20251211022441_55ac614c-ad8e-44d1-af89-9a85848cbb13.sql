-- Add playbook_progress column to user_product_builds table
ALTER TABLE public.user_product_builds 
ADD COLUMN IF NOT EXISTS playbook_progress jsonb DEFAULT '{"completedSteps": [], "startedAt": null, "completedAt": null}'::jsonb;