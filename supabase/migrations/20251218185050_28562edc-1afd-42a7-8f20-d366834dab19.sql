-- Revoke public access to award_camly_coins function
-- This prevents authenticated users from calling it directly via RPC
-- Only edge functions with service_role can call this function

REVOKE ALL ON FUNCTION public.award_camly_coins(uuid, integer, text, text, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.award_camly_coins(uuid, integer, text, text, text, boolean) FROM anon;
REVOKE ALL ON FUNCTION public.award_camly_coins(uuid, integer, text, text, text, boolean) FROM authenticated;

-- Grant only to service_role (used by edge functions)
GRANT EXECUTE ON FUNCTION public.award_camly_coins(uuid, integer, text, text, text, boolean) TO service_role;