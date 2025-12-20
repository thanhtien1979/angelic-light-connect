-- Update friendships policy to prevent blocked users from sending friend requests
DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;

CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (
  (auth.uid() = requester_id) 
  AND (requester_id <> addressee_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = addressee_id AND blocked_id = requester_id)
       OR (blocker_id = requester_id AND blocked_id = addressee_id)
  )
);

-- Update private_messages policy to prevent blocked users from sending messages
DROP POLICY IF EXISTS "Users can send messages to friends" ON public.private_messages;

CREATE POLICY "Users can send messages to friends"
ON public.private_messages
FOR INSERT
WITH CHECK (
  (auth.uid() = sender_id) 
  AND (sender_id <> receiver_id) 
  AND EXISTS (
    SELECT 1 FROM friendships
    WHERE (friendships.status = 'accepted')
    AND (
      ((friendships.requester_id = auth.uid()) AND (friendships.addressee_id = private_messages.receiver_id))
      OR ((friendships.addressee_id = auth.uid()) AND (friendships.requester_id = private_messages.receiver_id))
    )
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = receiver_id AND blocked_id = sender_id)
       OR (blocker_id = sender_id AND blocked_id = receiver_id)
  )
);

-- Create user_reports table for reporting users
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid,
  CONSTRAINT different_users CHECK (reporter_id <> reported_id)
);

-- Enable RLS on user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
ON public.user_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.user_reports
FOR SELECT
USING (auth.uid() = reporter_id);

-- Add realtime for friendships
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;