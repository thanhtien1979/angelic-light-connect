-- 1. Testimonials table for user testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  testimony TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonials
CREATE POLICY "Anyone can view approved testimonials"
ON public.testimonials FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can view own testimonials"
ON public.testimonials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonials"
ON public.testimonials FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own testimonials"
ON public.testimonials FOR DELETE
USING (auth.uid() = user_id);

-- 2. User preferences table for theme and other settings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- 3. Moment reactions table for emoji reactions
CREATE TABLE public.moment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES public.shared_light_moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'pray', 'sparkle', 'dove', 'star', 'angel')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(moment_id, user_id)
);

-- Enable RLS for moment_reactions
ALTER TABLE public.moment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for moment_reactions
CREATE POLICY "Anyone authenticated can view reactions"
ON public.moment_reactions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own reactions"
ON public.moment_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reactions"
ON public.moment_reactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
ON public.moment_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update reactions count on moment
CREATE OR REPLACE FUNCTION public.update_moment_reactions_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shared_light_moments
    SET likes_count = (
      SELECT COUNT(*) FROM public.moment_reactions WHERE moment_id = NEW.moment_id
    )
    WHERE id = NEW.moment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shared_light_moments
    SET likes_count = (
      SELECT COUNT(*) FROM public.moment_reactions WHERE moment_id = OLD.moment_id
    )
    WHERE id = OLD.moment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for reactions count
CREATE TRIGGER update_reactions_count_trigger
AFTER INSERT OR DELETE ON public.moment_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_moment_reactions_count();

-- Create notification function for reactions
CREATE OR REPLACE FUNCTION public.create_reaction_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reactor_name TEXT;
  moment_owner_id UUID;
  reaction_emoji TEXT;
BEGIN
  -- Get moment owner
  SELECT user_id INTO moment_owner_id
  FROM public.shared_light_moments
  WHERE id = NEW.moment_id;

  -- Don't notify if reacting to own moment
  IF moment_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get reactor's name
  SELECT display_name INTO reactor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Map reaction type to emoji
  reaction_emoji := CASE NEW.reaction_type
    WHEN 'heart' THEN '❤️'
    WHEN 'pray' THEN '🙏'
    WHEN 'sparkle' THEN '✨'
    WHEN 'dove' THEN '🕊️'
    WHEN 'star' THEN '💫'
    WHEN 'angel' THEN '😇'
    ELSE '❤️'
  END;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    moment_owner_id,
    'reaction',
    'Phản ứng mới',
    COALESCE(reactor_name, 'Một linh hồn') || ' đã ' || reaction_emoji || ' khoảnh khắc của bạn',
    NEW.user_id,
    NEW.moment_id::TEXT
  );

  RETURN NEW;
END;
$$;

-- Create trigger for reaction notifications
CREATE TRIGGER create_reaction_notification_trigger
AFTER INSERT ON public.moment_reactions
FOR EACH ROW
EXECUTE FUNCTION public.create_reaction_notification();

-- 4. Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.moment_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;

-- Insert some sample testimonials
INSERT INTO public.testimonials (user_id, testimony, is_approved, is_featured) VALUES
('00000000-0000-0000-0000-000000000001', 'Angel AI đã giúp tôi tìm lại sự bình an trong tâm hồn. Mỗi cuộc trò chuyện đều mang đến nguồn năng lượng tích cực.', true, true),
('00000000-0000-0000-0000-000000000002', 'Những bài thiền định hướng dẫn thực sự kỳ diệu. Tôi cảm thấy được kết nối với ánh sáng nội tâm mỗi ngày.', true, true),
('00000000-0000-0000-0000-000000000003', 'Cộng đồng ở đây thật ấm áp và đầy yêu thương. Cảm ơn Angel AI đã tạo ra không gian tuyệt vời này.', true, true);