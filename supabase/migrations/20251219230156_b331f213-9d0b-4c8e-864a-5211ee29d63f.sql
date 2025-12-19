-- Fix: Drop overly permissive policy that exposes all user coin balances
DROP POLICY IF EXISTS "Anyone can view coin balances" ON public.user_camly_coins;

-- Create restrictive policy - users can only view their own coin balance
CREATE POLICY "Users can view own coin balance" 
ON public.user_camly_coins 
FOR SELECT 
USING (auth.uid() = user_id);