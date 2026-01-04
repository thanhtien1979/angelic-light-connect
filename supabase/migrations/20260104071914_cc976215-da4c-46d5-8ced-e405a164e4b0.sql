-- Fix: Restrict notifications INSERT to service_role only
-- This prevents authenticated users from inserting arbitrary notifications
-- while allowing SECURITY DEFINER triggers and edge functions to still work

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create service-role-only INSERT policy
-- SECURITY DEFINER triggers execute as the function owner with elevated privileges,
-- so they will still be able to insert notifications
CREATE POLICY "Only system can create notifications"
ON public.notifications FOR INSERT
TO service_role
WITH CHECK (true);