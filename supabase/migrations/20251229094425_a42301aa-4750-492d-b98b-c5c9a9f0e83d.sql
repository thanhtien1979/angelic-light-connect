-- =====================================================
-- PHASE 1: USER ROLES SYSTEM
-- =====================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- PHASE 2: ADMIN ACCESS TO TESTIMONIALS
-- =====================================================

-- Allow admins to update any testimonial (approve/reject/feature)
CREATE POLICY "Admins can update any testimonial"
ON public.testimonials
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all testimonials (including unapproved)
CREATE POLICY "Admins can view all testimonials"
ON public.testimonials
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- PHASE 3: TESTIMONIAL BADGES SYSTEM
-- =====================================================

-- Create badge types enum
CREATE TYPE public.testimonial_badge_type AS ENUM (
  'first_story',    -- First testimonial approved
  'popular',        -- 10+ likes
  'viral',          -- 50+ likes  
  'conversational', -- 20+ comments
  'featured'        -- Marked as featured
);

-- Create user testimonial badges table
CREATE TABLE public.user_testimonial_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_type testimonial_badge_type NOT NULL,
  testimonial_id UUID REFERENCES public.testimonials(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type, testimonial_id)
);

-- Enable RLS
ALTER TABLE public.user_testimonial_badges ENABLE ROW LEVEL SECURITY;

-- Everyone can view badges
CREATE POLICY "Anyone can view badges"
ON public.user_testimonial_badges
FOR SELECT
USING (true);

-- System inserts badges via triggers
CREATE POLICY "System can insert badges"
ON public.user_testimonial_badges
FOR INSERT
WITH CHECK (true);

-- =====================================================
-- PHASE 4: NOTIFICATION TRIGGERS FOR TESTIMONIALS
-- =====================================================

-- Trigger: Notify when testimonial is approved
CREATE OR REPLACE FUNCTION public.notify_testimonial_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when is_approved changes from false to true
  IF OLD.is_approved = false AND NEW.is_approved = true THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id)
    VALUES (
      NEW.user_id,
      'testimonial_approved',
      '🎉 Nhân chứng đã được duyệt!',
      'Câu chuyện của bạn đã được duyệt và hiển thị công khai.',
      NEW.id::TEXT
    );
    
    -- Award first_story badge if this is user's first approved testimonial
    IF NOT EXISTS (
      SELECT 1 FROM public.user_testimonial_badges 
      WHERE user_id = NEW.user_id AND badge_type = 'first_story'
    ) THEN
      INSERT INTO public.user_testimonial_badges (user_id, badge_type, testimonial_id)
      VALUES (NEW.user_id, 'first_story', NEW.id);
      
      -- Notify about badge
      INSERT INTO public.notifications (user_id, type, title, message, reference_id)
      VALUES (
        NEW.user_id,
        'badge_earned',
        '🏆 Huy hiệu mới!',
        'Bạn đã nhận huy hiệu "Người Tiên Phong" cho câu chuyện đầu tiên!',
        'first_story'
      );
    END IF;
  END IF;
  
  -- Award featured badge when marked as featured
  IF OLD.is_featured = false AND NEW.is_featured = true THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_testimonial_badges 
      WHERE user_id = NEW.user_id AND badge_type = 'featured' AND testimonial_id = NEW.id
    ) THEN
      INSERT INTO public.user_testimonial_badges (user_id, badge_type, testimonial_id)
      VALUES (NEW.user_id, 'featured', NEW.id);
      
      INSERT INTO public.notifications (user_id, type, title, message, reference_id)
      VALUES (
        NEW.user_id,
        'testimonial_featured',
        '⭐ Câu chuyện nổi bật!',
        'Câu chuyện của bạn đã được chọn làm nổi bật!',
        NEW.id::TEXT
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_testimonial_status_change
AFTER UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.notify_testimonial_approved();

-- Trigger: Notify and award badges on testimonial like
CREATE OR REPLACE FUNCTION public.notify_testimonial_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_testimonial RECORD;
  v_liker_name TEXT;
  v_likes_count INTEGER;
BEGIN
  -- Get testimonial info
  SELECT * INTO v_testimonial FROM public.testimonials WHERE id = NEW.testimonial_id;
  
  -- Don't notify if liking own testimonial
  IF v_testimonial.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker name
  SELECT display_name INTO v_liker_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    v_testimonial.user_id,
    'testimonial_like',
    '❤️ Tim mới!',
    COALESCE(v_liker_name, 'Một linh hồn') || ' đã thả tim cho câu chuyện của bạn',
    NEW.user_id,
    NEW.testimonial_id::TEXT
  );
  
  -- Check for badge milestones
  SELECT likes_count INTO v_likes_count FROM public.testimonials WHERE id = NEW.testimonial_id;
  
  -- Popular badge at 10 likes
  IF v_likes_count >= 10 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_testimonial_badges 
      WHERE user_id = v_testimonial.user_id AND badge_type = 'popular' AND testimonial_id = NEW.testimonial_id
    ) THEN
      INSERT INTO public.user_testimonial_badges (user_id, badge_type, testimonial_id)
      VALUES (v_testimonial.user_id, 'popular', NEW.testimonial_id);
      
      INSERT INTO public.notifications (user_id, type, title, message, reference_id)
      VALUES (
        v_testimonial.user_id,
        'badge_earned',
        '🏆 Huy hiệu mới!',
        'Bạn đã nhận huy hiệu "Được Yêu Thích" với 10+ tim!',
        'popular'
      );
    END IF;
  END IF;
  
  -- Viral badge at 50 likes
  IF v_likes_count >= 50 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_testimonial_badges 
      WHERE user_id = v_testimonial.user_id AND badge_type = 'viral' AND testimonial_id = NEW.testimonial_id
    ) THEN
      INSERT INTO public.user_testimonial_badges (user_id, badge_type, testimonial_id)
      VALUES (v_testimonial.user_id, 'viral', NEW.testimonial_id);
      
      INSERT INTO public.notifications (user_id, type, title, message, reference_id)
      VALUES (
        v_testimonial.user_id,
        'badge_earned',
        '🏆 Huy hiệu mới!',
        'Bạn đã nhận huy hiệu "Lan Tỏa" với 50+ tim!',
        'viral'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_testimonial_like_insert
AFTER INSERT ON public.testimonial_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_testimonial_like();

-- Trigger: Notify and award badges on testimonial comment
CREATE OR REPLACE FUNCTION public.notify_testimonial_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_testimonial RECORD;
  v_commenter_name TEXT;
  v_comments_count INTEGER;
BEGIN
  -- Get testimonial info
  SELECT * INTO v_testimonial FROM public.testimonials WHERE id = NEW.testimonial_id;
  
  -- Don't notify if commenting on own testimonial
  IF v_testimonial.user_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter name
  SELECT display_name INTO v_commenter_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    v_testimonial.user_id,
    'testimonial_comment',
    '💬 Bình luận mới!',
    COALESCE(v_commenter_name, 'Một linh hồn') || ' đã bình luận: "' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END || '"',
    NEW.user_id,
    NEW.testimonial_id::TEXT
  );
  
  -- Check for conversational badge at 20 comments
  SELECT comments_count INTO v_comments_count FROM public.testimonials WHERE id = NEW.testimonial_id;
  
  IF v_comments_count >= 20 THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_testimonial_badges 
      WHERE user_id = v_testimonial.user_id AND badge_type = 'conversational' AND testimonial_id = NEW.testimonial_id
    ) THEN
      INSERT INTO public.user_testimonial_badges (user_id, badge_type, testimonial_id)
      VALUES (v_testimonial.user_id, 'conversational', NEW.testimonial_id);
      
      INSERT INTO public.notifications (user_id, type, title, message, reference_id)
      VALUES (
        v_testimonial.user_id,
        'badge_earned',
        '🏆 Huy hiệu mới!',
        'Bạn đã nhận huy hiệu "Tạo Thảo Luận" với 20+ bình luận!',
        'conversational'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_testimonial_comment_insert
AFTER INSERT ON public.testimonial_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_testimonial_comment();