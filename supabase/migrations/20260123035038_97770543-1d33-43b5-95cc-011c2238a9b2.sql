-- Drop and recreate the get_profile_safe function with updated signature
DROP FUNCTION IF EXISTS public.get_profile_safe(uuid);

-- Create a safe function to get profiles without encryption_salt
CREATE FUNCTION public.get_profile_safe(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.created_at
  FROM profiles p
  WHERE p.id = target_user_id
  AND (
    auth.uid() = target_user_id 
    OR can_view_profile(auth.uid(), target_user_id)
  )
$$;

-- Restrict access to authenticated users only
REVOKE ALL ON FUNCTION public.get_profile_safe(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_safe(uuid) TO authenticated;