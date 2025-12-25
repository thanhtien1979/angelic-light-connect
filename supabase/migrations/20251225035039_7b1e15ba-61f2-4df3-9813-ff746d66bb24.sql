-- Fix Security Definer views by changing to Security Invoker
-- This ensures RLS policies of the querying user are enforced

ALTER VIEW public.public_shared_light_moments SET (security_invoker = on);
ALTER VIEW public.public_generated_images SET (security_invoker = on);