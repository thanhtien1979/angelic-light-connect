-- Fix PUBLIC_DATA_EXPOSURE: Restrict user_camly_coins to owner-only access
-- Drop the overly permissive policy that allows anyone to view coin balances
DROP POLICY IF EXISTS "Anyone can view coin balances" ON public.user_camly_coins;

-- Ensure only users can view their own coin balance (this policy should already exist, but we'll recreate to be safe)
DROP POLICY IF EXISTS "Users can view own coin balance" ON public.user_camly_coins;
CREATE POLICY "Users can view own coin balance"
ON public.user_camly_coins FOR SELECT
USING (auth.uid() = user_id);