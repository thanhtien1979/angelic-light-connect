
-- Fix Issue 1: Add explicit authentication requirement to profiles table
-- Drop existing policies and recreate with auth check
DROP POLICY IF EXISTS "Users can view other profiles based on privacy" ON public.profiles;

-- Recreate with explicit auth.uid() IS NOT NULL check
CREATE POLICY "Users can view other profiles based on privacy"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() <> id 
  AND can_view_profile(auth.uid(), id)
);

-- Fix Issue 3: Recreate view with security_invoker=on
DROP VIEW IF EXISTS public.public_generated_images;

CREATE VIEW public.public_generated_images 
WITH (security_invoker=on) AS
SELECT 
  id,
  image_url,
  prompt,
  is_public,
  likes_count,
  is_minted,
  token_id,
  created_at
FROM public.generated_images
WHERE is_public = true;

-- Grant appropriate permissions on the view
GRANT SELECT ON public.public_generated_images TO authenticated;
GRANT SELECT ON public.public_generated_images TO anon;
