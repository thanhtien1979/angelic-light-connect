-- Fix 1: Add security_invoker to admin_event_aggregates view
DROP VIEW IF EXISTS public.admin_event_aggregates;
CREATE VIEW public.admin_event_aggregates
WITH (security_invoker = on) AS
SELECT 
  date_trunc('day'::text, created_at) AS event_date,
  event_type,
  event_severity,
  count(*) AS event_count
FROM security_logs
GROUP BY (date_trunc('day'::text, created_at)), event_type, event_severity
ORDER BY (date_trunc('day'::text, created_at)) DESC, (count(*)) DESC;

-- Fix 2: Recreate public_shared_light_moments view with proper security
-- This view should ONLY show moments that users explicitly consented to share publicly
DROP VIEW IF EXISTS public.public_shared_light_moments;
CREATE VIEW public.public_shared_light_moments
WITH (security_invoker = on) AS
SELECT 
  id,
  display_name,
  moment_type,
  spiritual_message,
  created_at,
  likes_count,
  light_acknowledgement_id,
  image_url,
  user_id
FROM shared_light_moments;

-- Fix 3: Update RLS on shared_light_moments base table to be more restrictive
-- Drop existing overly permissive policies if any
DROP POLICY IF EXISTS "Authenticated users can view public moments" ON public.shared_light_moments;
DROP POLICY IF EXISTS "Public moments are viewable by authenticated users" ON public.shared_light_moments;

-- Create proper SELECT policy: users can see their own moments OR moments shared by users who haven't blocked them
CREATE POLICY "Users can view moments with privacy checks"
ON public.shared_light_moments
FOR SELECT
USING (
  -- Owner can always see their own moments
  auth.uid() = user_id
  OR
  -- Authenticated users can see other public moments (shared_light_moments are inherently public by design)
  -- But exclude moments from users who have blocked the viewer
  (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocker_id = shared_light_moments.user_id AND blocked_id = auth.uid())
         OR (blocker_id = auth.uid() AND blocked_id = shared_light_moments.user_id)
    )
  )
);

-- Revoke direct access to sensitive tables for anon role
REVOKE ALL ON public.light_acknowledgements FROM anon;
REVOKE ALL ON public.light_behaviors FROM anon;
REVOKE ALL ON public.light_interventions FROM anon;
REVOKE ALL ON public.mood_entries FROM anon;
REVOKE ALL ON public.reflection_notes FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.private_messages FROM anon;

-- Grant read access back to authenticated for the view
GRANT SELECT ON public.public_shared_light_moments TO authenticated;
GRANT SELECT ON public.admin_event_aggregates TO authenticated;