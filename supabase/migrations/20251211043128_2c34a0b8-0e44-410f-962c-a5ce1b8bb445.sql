-- Revenue Goals Table
CREATE TABLE public.revenue_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_amount INTEGER NOT NULL DEFAULT 500,
  current_amount INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenue goals" ON public.revenue_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own revenue goals" ON public.revenue_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own revenue goals" ON public.revenue_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own revenue goals" ON public.revenue_goals FOR DELETE USING (auth.uid() = user_id);

-- User Achievements Table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community Wins Table (Success Wall)
CREATE TABLE public.community_wins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  win_type TEXT NOT NULL DEFAULT 'launched',
  niche_name TEXT,
  platform TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public wins" ON public.community_wins FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create their own wins" ON public.community_wins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wins" ON public.community_wins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wins" ON public.community_wins FOR DELETE USING (auth.uid() = user_id);

-- Add products_launched count to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS products_launched INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;