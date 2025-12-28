-- Create trigger for comment notifications
CREATE OR REPLACE FUNCTION public.create_comment_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  commenter_name TEXT;
  moment_owner_id UUID;
BEGIN
  -- Get the moment owner's user_id
  SELECT user_id INTO moment_owner_id
  FROM public.shared_light_moments
  WHERE id = NEW.moment_id;

  -- Don't notify if commenting on own moment
  IF moment_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter's display name
  SELECT display_name INTO commenter_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Create notification for the moment owner
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    moment_owner_id,
    'comment',
    'Bình luận mới',
    COALESCE(commenter_name, 'Một linh hồn') || ' đã bình luận về khoảnh khắc của bạn',
    NEW.user_id,
    NEW.moment_id::TEXT
  );

  RETURN NEW;
END;
$function$;

-- Create trigger on moment_comments
DROP TRIGGER IF EXISTS on_new_comment ON public.moment_comments;
CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.moment_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();

-- Create saved_moments table for bookmarks
CREATE TABLE IF NOT EXISTS public.saved_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  moment_id UUID NOT NULL REFERENCES public.shared_light_moments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, moment_id)
);

-- Enable RLS
ALTER TABLE public.saved_moments ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_moments
CREATE POLICY "Users can view own saved moments"
  ON public.saved_moments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save moments"
  ON public.saved_moments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave moments"
  ON public.saved_moments FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_moments_user_id ON public.saved_moments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_moments_moment_id ON public.saved_moments(moment_id);