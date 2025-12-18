-- Bảng lưu trữ Camly Coin của người dùng
CREATE TABLE public.user_camly_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_coins BIGINT NOT NULL DEFAULT 0,
  lifetime_coins BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Bảng ghi nhận các khoảnh khắc ánh sáng (light acknowledgements)
CREATE TABLE public.light_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acknowledgement_type TEXT NOT NULL CHECK (acknowledgement_type IN ('meditation_completion', 'reflection_note', 'daily_login', 'sharing_moment')),
  camly_coins INTEGER NOT NULL DEFAULT 50000,
  spiritual_message TEXT NOT NULL,
  source_id TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bảng tracking hoàn thành meditation
CREATE TABLE public.meditation_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  completion_percent INTEGER NOT NULL DEFAULT 0,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rewarded BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, track_id, completed_date)
);

-- Bảng suy ngẫm/biết ơn
CREATE TABLE public.reflection_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  sincerity_score DECIMAL(3,2) DEFAULT 0.00,
  approved BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bảng chia sẻ khoảnh khắc ánh sáng công khai
CREATE TABLE public.shared_light_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  light_acknowledgement_id UUID REFERENCES public.light_acknowledgements(id) ON DELETE CASCADE,
  display_name TEXT,
  moment_type TEXT NOT NULL,
  spiritual_message TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_camly_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.light_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_light_moments ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho user_camly_coins (public read, owner write)
CREATE POLICY "Anyone can view coin balances"
ON public.user_camly_coins FOR SELECT USING (true);

CREATE POLICY "Users can insert own coins"
ON public.user_camly_coins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coins"
ON public.user_camly_coins FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies cho light_acknowledgements
CREATE POLICY "Users can view own or public acknowledgements"
ON public.light_acknowledgements FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own acknowledgements"
ON public.light_acknowledgements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own acknowledgements"
ON public.light_acknowledgements FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies cho meditation_completions
CREATE POLICY "Users can view own completions"
ON public.meditation_completions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
ON public.meditation_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
ON public.meditation_completions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies cho reflection_notes
CREATE POLICY "Users can view own or public reflections"
ON public.reflection_notes FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own reflections"
ON public.reflection_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
ON public.reflection_notes FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies cho shared_light_moments (fully public read)
CREATE POLICY "Anyone can view shared moments"
ON public.shared_light_moments FOR SELECT USING (true);

CREATE POLICY "Users can share own moments"
ON public.shared_light_moments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shared moments"
ON public.shared_light_moments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shared moments"
ON public.shared_light_moments FOR DELETE USING (auth.uid() = user_id);

-- Function to award coins
CREATE OR REPLACE FUNCTION public.award_camly_coins(
  p_user_id UUID,
  p_coins INTEGER,
  p_type TEXT,
  p_message TEXT,
  p_source_id TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acknowledgement_id UUID;
BEGIN
  INSERT INTO public.user_camly_coins (user_id, total_coins, lifetime_coins)
  VALUES (p_user_id, p_coins, p_coins)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_coins = user_camly_coins.total_coins + p_coins,
    lifetime_coins = user_camly_coins.lifetime_coins + p_coins,
    updated_at = now();
  
  INSERT INTO public.light_acknowledgements (user_id, acknowledgement_type, camly_coins, spiritual_message, source_id, is_public)
  VALUES (p_user_id, p_type, p_coins, p_message, p_source_id, p_is_public)
  RETURNING id INTO v_acknowledgement_id;
  
  RETURN v_acknowledgement_id;
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_user_camly_coins_updated_at
BEFORE UPDATE ON public.user_camly_coins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();