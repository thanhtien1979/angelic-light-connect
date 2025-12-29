-- Add new columns to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

-- Create testimonial_likes table
CREATE TABLE public.testimonial_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(testimonial_id, user_id)
);

-- Enable RLS on testimonial_likes
ALTER TABLE public.testimonial_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonial_likes
CREATE POLICY "Users can like approved testimonials"
ON public.testimonial_likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.testimonials 
    WHERE id = testimonial_id AND is_approved = true
  )
);

CREATE POLICY "Users can unlike their own likes"
ON public.testimonial_likes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes on approved testimonials"
ON public.testimonial_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.testimonials 
    WHERE id = testimonial_id AND is_approved = true
  )
);

-- Create testimonial_comments table
CREATE TABLE public.testimonial_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on testimonial_comments
ALTER TABLE public.testimonial_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonial_comments
CREATE POLICY "Users can comment on approved testimonials"
ON public.testimonial_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.testimonials 
    WHERE id = testimonial_id AND is_approved = true
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.testimonial_comments
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments on approved testimonials"
ON public.testimonial_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.testimonials 
    WHERE id = testimonial_id AND is_approved = true
  )
);

-- Trigger function to update likes_count
CREATE OR REPLACE FUNCTION public.update_testimonial_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.testimonials
    SET likes_count = (
      SELECT COUNT(*) FROM public.testimonial_likes WHERE testimonial_id = NEW.testimonial_id
    )
    WHERE id = NEW.testimonial_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.testimonials
    SET likes_count = (
      SELECT COUNT(*) FROM public.testimonial_likes WHERE testimonial_id = OLD.testimonial_id
    )
    WHERE id = OLD.testimonial_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for likes count
CREATE TRIGGER update_testimonial_likes_count_trigger
AFTER INSERT OR DELETE ON public.testimonial_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_testimonial_likes_count();

-- Trigger function to update comments_count
CREATE OR REPLACE FUNCTION public.update_testimonial_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.testimonials
    SET comments_count = (
      SELECT COUNT(*) FROM public.testimonial_comments WHERE testimonial_id = NEW.testimonial_id
    )
    WHERE id = NEW.testimonial_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.testimonials
    SET comments_count = (
      SELECT COUNT(*) FROM public.testimonial_comments WHERE testimonial_id = OLD.testimonial_id
    )
    WHERE id = OLD.testimonial_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for comments count
CREATE TRIGGER update_testimonial_comments_count_trigger
AFTER INSERT OR DELETE ON public.testimonial_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_testimonial_comments_count();

-- Enable realtime for testimonial_likes and testimonial_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonial_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonial_comments;