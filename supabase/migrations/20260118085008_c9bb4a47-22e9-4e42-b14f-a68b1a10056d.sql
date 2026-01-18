-- Drop the profiles_public view that exposes user data without authentication
-- This view is not used in the application code (app uses profiles table with RLS directly)
-- Removing it eliminates the security vulnerability

DROP VIEW IF EXISTS public.profiles_public;

-- Add comment to document why this was removed
COMMENT ON TABLE public.profiles IS 'User profiles table with RLS policies. The profiles_public view was removed for security reasons - use get_profile_safe() function or direct table access with RLS instead.';