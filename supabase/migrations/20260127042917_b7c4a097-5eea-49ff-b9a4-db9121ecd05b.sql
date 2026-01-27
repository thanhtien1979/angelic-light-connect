-- Fix security issues: views without RLS protection

-- 1. Recreate safe_profiles view with security_invoker to respect base table RLS
DROP VIEW IF EXISTS public.safe_profiles;
CREATE VIEW public.safe_profiles 
WITH (security_invoker=on) AS
SELECT 
  id,
  display_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- Grant access to authenticated users only (not anon)
REVOKE ALL ON public.safe_profiles FROM anon;
GRANT SELECT ON public.safe_profiles TO authenticated;

-- 2. Recreate public_generated_images view with security_invoker
DROP VIEW IF EXISTS public.public_generated_images;
CREATE VIEW public.public_generated_images
WITH (security_invoker=on) AS
SELECT 
  id,
  user_id,
  prompt,
  image_url,
  is_public,
  is_minted,
  token_id,
  likes_count,
  created_at
FROM public.generated_images
WHERE is_public = true;

-- Grant access to authenticated users only for public images
REVOKE ALL ON public.public_generated_images FROM anon;
GRANT SELECT ON public.public_generated_images TO authenticated;

-- 3. Ensure the base generated_images table has proper RLS
-- Check if RLS is enabled and add missing policies
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view public images" ON public.generated_images;
DROP POLICY IF EXISTS "Public images viewable by all" ON public.generated_images;

-- Create proper RLS policies for generated_images
CREATE POLICY "Users can view their own images"
ON public.generated_images
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public images"
ON public.generated_images
FOR SELECT
USING (is_public = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own images"
ON public.generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
ON public.generated_images
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.generated_images
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Strengthen profiles table to ensure encryption_salt is protected
-- First verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any overly permissive policies that might allow reading encryption_salt
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Ensure the existing owner-only SELECT policy exists
-- If there's no SELECT policy, authenticated users with the can_view_profile function will be blocked
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow viewing other profiles only through safe functions (no encryption_salt exposure)
-- The get_profile_safe function is the only way to view other users' public data

-- 5. Revoke direct anon access to sensitive tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.generated_images FROM anon;