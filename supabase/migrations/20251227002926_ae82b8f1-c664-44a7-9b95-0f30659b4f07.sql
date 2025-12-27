-- Create user_follows table for follow feature
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can follow others"
ON public.user_follows
FOR INSERT
WITH CHECK (
  auth.uid() = follower_id 
  AND follower_id <> following_id
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = following_id AND blocked_id = follower_id)
    OR (blocker_id = follower_id AND blocked_id = following_id)
  )
);

CREATE POLICY "Users can unfollow"
ON public.user_follows
FOR DELETE
USING (auth.uid() = follower_id);

CREATE POLICY "Users can view follows"
ON public.user_follows
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_follows;