-- Fix: Restrict user_follows SELECT policy to only show relationships where the user is involved
-- This prevents social graph mapping and privacy violations

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view follows" ON public.user_follows;

-- Create a more restrictive policy that only shows follows the user is involved in
CREATE POLICY "Users can view own follow relationships"
ON public.user_follows
FOR SELECT
USING (
  (auth.uid() = follower_id) OR (auth.uid() = following_id)
);