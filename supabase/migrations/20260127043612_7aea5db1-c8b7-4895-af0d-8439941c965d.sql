-- Recreate safe_profiles view WITHOUT security_invoker so it bypasses RLS
-- This allows authenticated users to view other users' basic profile info
-- while still protecting sensitive fields like encryption_salt

DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles AS
SELECT 
  id,
  created_at,
  display_name,
  avatar_url,
  bio
FROM public.profiles;

-- Grant SELECT access to authenticated users
GRANT SELECT ON public.safe_profiles TO authenticated;

-- Also grant to anon for public profile pages (optional, remove if not needed)
REVOKE ALL ON public.safe_profiles FROM anon;