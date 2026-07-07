
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Anyone can view angel media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view angel media" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.add_reward_ledger_entry(uuid, integer, text, text, text, boolean, text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_event_stats(integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_behavior_stats(integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_security_stats(integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_profile_safe(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_presence_safe(uuid) FROM anon, PUBLIC;
