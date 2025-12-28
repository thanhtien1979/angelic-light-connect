-- Create moment_likes table to track who liked what
CREATE TABLE IF NOT EXISTS public.moment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  moment_id UUID NOT NULL REFERENCES public.shared_light_moments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, moment_id)
);

-- Enable RLS
ALTER TABLE public.moment_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all likes"
  ON public.moment_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can like moments"
  ON public.moment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike moments"
  ON public.moment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_moment_likes_moment_id ON public.moment_likes(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_likes_user_id ON public.moment_likes(user_id);

-- Create trigger for like notifications
CREATE OR REPLACE FUNCTION public.create_like_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  liker_name TEXT;
  moment_owner_id UUID;
BEGIN
  -- Get the moment owner's user_id
  SELECT user_id INTO moment_owner_id
  FROM public.shared_light_moments
  WHERE id = NEW.moment_id;

  -- Don't notify if liking own moment
  IF moment_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get liker's display name
  SELECT display_name INTO liker_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Create notification for the moment owner
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    moment_owner_id,
    'like',
    'Trái tim mới',
    COALESCE(liker_name, 'Một linh hồn') || ' đã yêu thích khoảnh khắc của bạn',
    NEW.user_id,
    NEW.moment_id::TEXT
  );

  -- Update likes_count on the moment
  UPDATE public.shared_light_moments
  SET likes_count = likes_count + 1
  WHERE id = NEW.moment_id;

  RETURN NEW;
END;
$function$;

-- Create trigger for unlike to decrement count
CREATE OR REPLACE FUNCTION public.handle_unlike()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.shared_light_moments
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = OLD.moment_id;
  
  RETURN OLD;
END;
$function$;

-- Create triggers
DROP TRIGGER IF EXISTS on_new_like ON public.moment_likes;
CREATE TRIGGER on_new_like
  AFTER INSERT ON public.moment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_like_notification();

DROP TRIGGER IF EXISTS on_unlike ON public.moment_likes;
CREATE TRIGGER on_unlike
  AFTER DELETE ON public.moment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_unlike();