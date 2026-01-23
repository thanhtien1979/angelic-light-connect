-- =============================================
-- SECURITY HARDENING: Profile & Private Messages
-- =============================================

-- 1. Create safe_profiles view (excludes encryption_salt)
CREATE OR REPLACE VIEW public.safe_profiles 
WITH (security_invoker = on) AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  created_at,
  updated_at,
  agreed_to_light_law
FROM public.profiles;

-- 2. Create helper function to check if users are blocked
CREATE OR REPLACE FUNCTION public.are_users_blocked(user1 uuid, user2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user1 AND blocked_id = user2)
       OR (blocker_id = user2 AND blocked_id = user1)
  );
$$;

-- Restrict function to authenticated users only
REVOKE ALL ON FUNCTION public.are_users_blocked(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.are_users_blocked(uuid, uuid) TO authenticated;

-- 3. Update profiles RLS - only owner can SELECT directly (others use safe_profiles view)
DROP POLICY IF EXISTS "Users can view other profiles based on privacy" ON public.profiles;

-- Keep existing owner policy or create if not exists
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Simplify private_messages RLS policy
DROP POLICY IF EXISTS "Users can view their own messages" ON public.private_messages;

CREATE POLICY "Users can view their own messages"
ON public.private_messages
FOR SELECT
TO authenticated
USING (
  (auth.uid() = sender_id OR auth.uid() = receiver_id)
  AND NOT public.are_users_blocked(
    auth.uid(), 
    CASE WHEN auth.uid() = sender_id THEN receiver_id ELSE sender_id END
  )
);

-- 5. Add indexes for blocked_users performance
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker 
ON public.blocked_users (blocker_id, blocked_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked 
ON public.blocked_users (blocked_id, blocker_id);

-- 6. Create admin audit logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  query_details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only service_role can insert (no direct user inserts)
CREATE POLICY "Service role inserts audit logs"
ON public.admin_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);