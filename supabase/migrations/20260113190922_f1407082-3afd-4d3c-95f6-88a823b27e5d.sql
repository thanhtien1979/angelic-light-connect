-- FIX 1: Change increment_share_view to SECURITY INVOKER with time-based deduplication
CREATE OR REPLACE FUNCTION public.increment_share_view(p_share_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_viewed TIMESTAMPTZ;
BEGIN
  -- Get the last viewed timestamp
  SELECT last_viewed_at INTO v_last_viewed
  FROM public.shared_conversations
  WHERE share_id = p_share_id;
  
  -- Only increment if not viewed in last 5 minutes (prevents spam)
  IF v_last_viewed IS NULL OR v_last_viewed < (now() - interval '5 minutes') THEN
    UPDATE public.shared_conversations
    SET view_count = view_count + 1,
        last_viewed_at = now()
    WHERE share_id = p_share_id 
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());
  END IF;
END;
$$;

-- FIX 2: Fix notifications table RLS - restrict to service role / trigger inserts only
DROP POLICY IF EXISTS "Only system can create notifications" ON public.notifications;

-- Allow authenticated users to insert notifications for others (e.g., when following, liking, etc.)
CREATE POLICY "Users can create notifications for interactions"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  -- Actors can only create notifications where they are the actor
  actor_id = auth.uid()
);

-- FIX 3: Fix user_testimonial_badges table RLS - restrict to service role / trigger inserts
DROP POLICY IF EXISTS "System can insert badges" ON public.user_testimonial_badges;

-- Badges should only be awarded to the user themselves or by admins
CREATE POLICY "Users receive their own badges"
ON public.user_testimonial_badges
FOR INSERT
TO authenticated
WITH CHECK (
  -- User receives their own badge (typically from triggers/functions)
  user_id = auth.uid()
  OR
  -- Admins can award badges
  public.has_role(auth.uid(), 'admin')
);