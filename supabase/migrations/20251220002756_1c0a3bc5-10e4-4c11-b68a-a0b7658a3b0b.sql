-- Fix: Restrict profiles table to only authenticated users
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow users to view their own profile even without full authentication check
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);