-- Create PLR Vault Items table
CREATE TABLE public.plr_vault_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_sample TEXT,
  niche_category TEXT NOT NULL,
  product_type TEXT NOT NULL,
  funnel_role TEXT NOT NULL DEFAULT 'front_end',
  suggested_price_min NUMERIC(10,2) DEFAULT 7,
  suggested_price_max NUMERIC(10,2) DEFAULT 27,
  license_type TEXT NOT NULL DEFAULT 'editable_sellable',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_pro_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PLR Quickstart Kits table
CREATE TABLE public.plr_quickstart_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  niche_category TEXT NOT NULL,
  included_item_ids UUID[] DEFAULT '{}',
  suggested_funnel_order TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  is_featured BOOLEAN DEFAULT false,
  is_pro_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plr_vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plr_quickstart_kits ENABLE ROW LEVEL SECURITY;

-- Anyone can read active vault items (free users see limited, pro sees all)
CREATE POLICY "Anyone can read active vault items"
ON public.plr_vault_items
FOR SELECT
USING (is_active = true);

-- Anyone can read kits
CREATE POLICY "Anyone can read quickstart kits"
ON public.plr_quickstart_kits
FOR SELECT
USING (true);

-- Seed some initial PLR vault items
INSERT INTO public.plr_vault_items (title, description, content_sample, niche_category, product_type, funnel_role, suggested_price_min, suggested_price_max, license_type, tags, is_pro_only) VALUES
('90-Day Fitness Transformation Planner', 'Complete workout and meal planning system for beginners starting their fitness journey', 'Week 1: Foundation Building\n- Day 1: Full body assessment\n- Day 2: Goal setting workshop\n- Day 3: Nutrition basics...', 'health_fitness', 'planner', 'front_end', 12, 27, 'editable_sellable', ARRAY['fitness', 'planner', 'workout', 'beginner'], false),
('Weight Loss Mindset Journal', 'Daily reflection journal combining mindset work with weight loss tracking', 'Morning Affirmations:\nI am worthy of a healthy body...\nDaily Reflection Prompts:\n- What did I eat today that made me feel good?', 'health_fitness', 'journal', 'upsell', 9, 19, 'editable_sellable', ARRAY['weight loss', 'journal', 'mindset'], false),
('21-Day Healthy Habits Challenge', 'Gamified challenge workbook to build lasting healthy habits', 'Day 1: Drink 8 glasses of water\nDay 2: 10-minute morning stretch\nDay 3: Meal prep Sunday...', 'health_fitness', 'challenge', 'lead_magnet', 0, 9, 'editable_sellable', ARRAY['habits', 'challenge', 'health'], false),
('Manifestation Mastery Workbook', 'Complete law of attraction workbook with scripting exercises and vision board templates', 'Chapter 1: Understanding Your Vibration\nExercise: Rate your current emotional state...\nScripting Template: Write your ideal day...', 'mindset_manifestation', 'workbook', 'front_end', 15, 37, 'editable_sellable', ARRAY['manifestation', 'law of attraction', 'workbook'], false),
('Daily Gratitude & Affirmations Journal', 'Simple daily practice journal for gratitude and positive affirmations', 'Today I am grateful for:\n1. ___\n2. ___\n3. ___\n\nMy affirmation for today: ___', 'mindset_manifestation', 'journal', 'lead_magnet', 0, 12, 'editable_sellable', ARRAY['gratitude', 'affirmations', 'daily'], false),
('Vision Board Printable Kit', 'Beautiful printable elements for creating digital or physical vision boards', 'Includes: 50+ motivational quotes, goal category headers, aesthetic backgrounds, sticker elements...', 'mindset_manifestation', 'printable', 'bonus', 5, 15, 'editable_sellable', ARRAY['vision board', 'printable', 'aesthetic'], false),
('Etsy Seller Starter Guide', 'Complete beginner guide to launching your first Etsy shop with digital products', 'Chapter 1: Setting Up Your Shop\n- Choosing your niche\n- Creating your brand\n- Listing optimization basics...', 'online_business', 'ebook', 'front_end', 17, 47, 'editable_sellable', ARRAY['etsy', 'digital products', 'beginner'], true),
('Social Media Content Calendar', '30-day content planning system with post templates and hashtag research', 'Week 1: Introduction Series\nMonday: Who you are post\nTuesday: Your why story\nWednesday: Behind the scenes...', 'online_business', 'planner', 'upsell', 12, 27, 'editable_sellable', ARRAY['social media', 'content', 'calendar'], false),
('Email Marketing Swipe File', '50+ email templates for launches, nurturing, and sales sequences', 'Welcome Email Template:\nSubject: Welcome to [Brand] - Your journey starts here!\n\nHey [Name],\n\nI''m so excited you''re here...', 'online_business', 'templates', 'bonus', 9, 19, 'editable_sellable', ARRAY['email', 'templates', 'marketing'], true),
('Productivity Power Planner', 'Time-blocking and priority management system for busy entrepreneurs', 'Morning Power Hour:\n6:00 AM - Mindset & movement\n7:00 AM - Deep work block\n8:00 AM - Communication time...', 'productivity', 'planner', 'front_end', 12, 27, 'editable_sellable', ARRAY['productivity', 'time management', 'planner'], false),
('Weekly Goal Setting Worksheets', 'Simple weekly planning sheets with goal breakdown and reflection', 'This Week''s Top 3 Priorities:\n1. ___\n2. ___\n3. ___\n\nTime Blocks Available: ___', 'productivity', 'worksheet', 'lead_magnet', 0, 9, 'editable_sellable', ARRAY['goals', 'weekly', 'planning'], false),
('Habit Tracker Bundle', 'Monthly and weekly habit tracking printables in multiple styles', '30-Day Habit Grid\nWeekly Habit Wheel\nMinimalist Daily Tracker\nColorful Habit Stickers...', 'productivity', 'printable', 'bonus', 5, 12, 'editable_sellable', ARRAY['habits', 'tracker', 'printable'], false),
('Self-Love Journey Journal', 'Guided journal for building self-esteem and practicing self-compassion', 'Prompt: Write a love letter to yourself...\nExercise: List 10 things your body does for you every day...', 'self_improvement', 'journal', 'front_end', 12, 27, 'editable_sellable', ARRAY['self-love', 'journal', 'confidence'], false),
('Anxiety Relief Toolkit', 'Practical exercises and worksheets for managing anxiety and stress', 'Grounding Exercise: 5-4-3-2-1\nBreathing Technique: Box Breathing\nThought Record Worksheet...', 'self_improvement', 'workbook', 'front_end', 15, 37, 'editable_sellable', ARRAY['anxiety', 'mental health', 'stress'], false),
('Morning Routine Blueprint', 'Step-by-step guide to creating a powerful morning routine', 'The 5 AM Club Framework:\n5:00 - Wake & hydrate\n5:15 - Movement\n5:30 - Mindset\n5:45 - Learning...', 'self_improvement', 'ebook', 'lead_magnet', 0, 12, 'editable_sellable', ARRAY['morning routine', 'habits', 'productivity'], false);

-- Seed quickstart kits
INSERT INTO public.plr_quickstart_kits (title, description, niche_category, difficulty_level, is_featured, is_pro_only) VALUES
('90-Day Fitness Launch Kit', 'Everything you need to launch a fitness digital product line - planner, journal, and challenge workbook ready to customize and sell', 'health_fitness', 'beginner', true, false),
('Manifestation Starter Pack', 'Complete manifestation bundle including workbook, gratitude journal, and vision board kit - perfect for the spiritual wellness niche', 'mindset_manifestation', 'beginner', true, false),
('Etsy Seller Success Kit', 'Launch your Etsy shop with confidence - includes seller guide, content calendar, and email templates', 'online_business', 'intermediate', true, true),
('Productivity Power Bundle', 'Help your audience get more done with this complete productivity system - planner, goal worksheets, and habit trackers', 'productivity', 'beginner', false, false),
('Self-Improvement Starter Kit', 'Build a self-improvement brand with journal, anxiety toolkit, and morning routine guide', 'self_improvement', 'beginner', false, false);