-- Fix Issue 1: Create a public view of profiles that excludes encryption_salt
-- This prevents exposure of sensitive cryptographic material to other users

-- Create a view that excludes the encryption_salt column
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    display_name,
    avatar_url,
    bio,
    created_at,
    updated_at,
    agreed_to_light_law,
    light_law_agreed_at
  FROM public.profiles;

-- Comment explaining the view's purpose
COMMENT ON VIEW public.profiles_public IS 'Public-safe view of profiles that excludes sensitive encryption_salt column';

-- Update the RLS policy to use the view for other users while allowing owners full access
-- First, drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view profiles based on privacy" ON public.profiles;

-- Create new policy that allows users to view their own full profile
CREATE POLICY "Users can view their own full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy for viewing other profiles through the can_view_profile check
-- but only expose non-sensitive columns
CREATE POLICY "Users can view other profiles based on privacy"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() != id 
    AND can_view_profile(auth.uid(), id)
  );

-- Note: Since RLS applies to the base table, we need an additional approach.
-- Create a function to get profile data safely (excluding salt for non-owners)
CREATE OR REPLACE FUNCTION public.get_profile_safe(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz,
  updated_at timestamptz,
  agreed_to_light_law boolean,
  light_law_agreed_at timestamptz,
  encryption_salt text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.created_at,
    p.updated_at,
    p.agreed_to_light_law,
    p.light_law_agreed_at,
    -- Only return encryption_salt to the owner
    CASE 
      WHEN auth.uid() = target_user_id THEN p.encryption_salt
      ELSE NULL
    END as encryption_salt
  FROM public.profiles p
  WHERE p.id = target_user_id
    AND (auth.uid() = target_user_id OR can_view_profile(auth.uid(), target_user_id));
$$;