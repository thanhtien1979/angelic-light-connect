-- Add video_url column to testimonials table for video testimonials
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add tags column if it doesn't exist
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add index for tag-based filtering performance after ensuring column exists
CREATE INDEX IF NOT EXISTS idx_testimonials_tags ON public.testimonials USING GIN(tags);