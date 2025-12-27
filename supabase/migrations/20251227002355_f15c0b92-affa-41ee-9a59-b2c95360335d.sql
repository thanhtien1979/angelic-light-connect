-- Create moment_comments table for community interactions
CREATE TABLE public.moment_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL REFERENCES public.shared_light_moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moment_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moment_comments
CREATE POLICY "Users can view all comments on public moments"
ON public.moment_comments
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own comments"
ON public.moment_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.moment_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_moment_comments_moment_id ON public.moment_comments(moment_id);
CREATE INDEX idx_moment_comments_created_at ON public.moment_comments(created_at DESC);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.moment_comments;