-- Fix 1: Add authentication requirement for profiles table viewing
-- Currently anyone can query profiles directly, we need to require authentication

-- Drop the duplicate/overlapping policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

-- Create a single consolidated policy for authenticated users to view their own profile
CREATE POLICY "Authenticated users can view own profile" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL AND auth.uid() = id
);

-- Allow viewing other profiles through the safe function (which uses can_view_profile)
-- This is already handled by get_profile_safe function

-- Fix 2: Recreate safe_profiles view with SECURITY INVOKER (instead of SECURITY DEFINER)
-- This ensures RLS policies of the querying user are enforced
DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles 
WITH (security_invoker = on)
AS SELECT 
    id,
    created_at,
    display_name,
    avatar_url,
    bio
FROM public.profiles
WHERE auth.uid() IS NOT NULL;

-- Grant access to authenticated users only
REVOKE ALL ON public.safe_profiles FROM anon;
REVOKE ALL ON public.safe_profiles FROM public;
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Fix 3: Recreate public_profiles view with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.created_at,
    COALESCE(lp.light_score, 0) AS light_score
FROM public.profiles p
LEFT JOIN public.user_light_profile lp ON lp.user_id = p.id
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.privacy_settings ps
    WHERE ps.user_id = p.id AND ps.profile_visibility = 'nobody'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users bu
    WHERE (bu.blocker_id = auth.uid() AND bu.blocked_id = p.id)
       OR (bu.blocker_id = p.id AND bu.blocked_id = auth.uid())
  );

-- Grant access to authenticated users only  
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_profiles FROM public;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Fix 4: Improve group_messages RLS to include joined_at timestamp check
-- This prevents users from seeing messages sent before they joined
DROP POLICY IF EXISTS "Group members can view messages" ON public.group_messages;

CREATE POLICY "Group members can view messages after joining" ON public.group_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_messages.group_id 
    AND gm.user_id = auth.uid()
    AND group_messages.created_at >= gm.joined_at
  )
);

-- Fix 5: Add explicit revoke from anon for profiles table to prevent any direct access
REVOKE ALL ON public.profiles FROM anon;