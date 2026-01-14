-- Fix: Restrict shared_light_moments SELECT policy to authenticated users only
-- This prevents anonymous access to user spiritual content

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view shared moments" ON public.shared_light_moments;

-- Create a more restrictive policy that requires authentication
CREATE POLICY "Authenticated users can view shared moments"
ON public.shared_light_moments
FOR SELECT
USING (auth.uid() IS NOT NULL);