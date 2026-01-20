-- Views cannot have RLS policies directly, but we can control access via GRANTs
-- Revoke all access from anon role to ensure only authenticated users can access

-- Revoke anon access from public views
REVOKE ALL ON public.public_profiles FROM anon;
REVOKE ALL ON public.public_shared_light_moments FROM anon;
REVOKE ALL ON public.public_generated_images FROM anon;
REVOKE ALL ON public.admin_event_aggregates FROM anon;

-- Also ensure the base tables have proper anon restrictions
REVOKE ALL ON public.shared_light_moments FROM anon;
REVOKE ALL ON public.generated_images FROM anon;
REVOKE ALL ON public.security_logs FROM anon;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.user_light_profile FROM anon;

-- Grant SELECT only to authenticated users for the public views
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_shared_light_moments TO authenticated;
GRANT SELECT ON public.public_generated_images TO authenticated;

-- admin_event_aggregates should only be accessible to admin users
-- We cannot enforce this at GRANT level, so we'll rely on the RLS of security_logs
-- which already has "Only admins and auditors can view security logs" policy