-- FIX 1: Restrict angel_bios RLS to admin users only
DROP POLICY IF EXISTS "Authenticated users can insert angel bios" ON public.angel_bios;
DROP POLICY IF EXISTS "Authenticated users can update angel bios" ON public.angel_bios;

CREATE POLICY "Only admins can insert angel bios"
ON public.angel_bios
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update angel bios"
ON public.angel_bios
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- FIX 2: Make public storage buckets private (avatars, moment-images, universe-messages)
UPDATE storage.buckets SET public = false 
WHERE id IN ('avatars', 'moment-images', 'universe-messages');

-- FIX 3: Make angel-media storage bucket private
UPDATE storage.buckets SET public = false 
WHERE id = 'angel-media';