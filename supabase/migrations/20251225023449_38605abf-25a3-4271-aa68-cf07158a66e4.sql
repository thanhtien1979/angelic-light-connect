-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles table to authenticated users only
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix STORAGE_EXPOSURE: Make storage buckets private
-- Update generated-images bucket to private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'generated-images';

-- Update documents bucket to private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'documents';