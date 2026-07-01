
-- =========================================================
-- SECURITY FIXES
-- =========================================================

-- 1) gift_transactions: require auth for leaderboard read
DROP POLICY IF EXISTS "Anyone can view completed gifts for leaderboard" ON public.gift_transactions;
CREATE POLICY "Authenticated users can view completed gifts for leaderboard"
  ON public.gift_transactions FOR SELECT
  TO authenticated
  USING (status = 'completed');

-- 2) Private storage buckets: remove overly broad SELECT policies
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view moment images" ON storage.objects;

-- Add scoped SELECT policies for moment-images (owner + public-authenticated for social feed via signed URLs is preferred, but keep owner-only here)
CREATE POLICY "Users can view own moment images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'moment-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3) angel-media: scope writes to owner folder
DROP POLICY IF EXISTS "Authenticated users can upload angel media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update angel media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete angel media" ON storage.objects;

CREATE POLICY "Users can upload own angel media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'angel-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own angel media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'angel-media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'angel-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own angel media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'angel-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4) Public buckets: drop broad SELECT listing policies (files still accessible via public URL)
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Angel cursor videos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view universe message files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view universe-messages files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view angel media" ON storage.objects;

-- 5) user_camly_coins: remove direct INSERT (must go through SECURITY DEFINER fns)
DROP POLICY IF EXISTS "Users can insert own coins" ON public.user_camly_coins;
DROP POLICY IF EXISTS "Users can update own coins" ON public.user_camly_coins;

-- 6) user_achievements: remove self-INSERT (must go through server-side grant)
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

-- 7) Realtime: remove security_logs from publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.security_logs;

-- 8) Realtime channel access control on realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_own_topic_select" ON realtime.messages;
CREATE POLICY "authenticated_own_topic_select"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    -- Allow subscription to postgres_changes broadcast for public tables handled by table RLS,
    -- but restrict user-topic channels to the owner's uid prefix.
    (realtime.topic() IS NULL)
    OR (realtime.topic() NOT LIKE 'user:%' AND realtime.topic() NOT LIKE 'private:%')
    OR (realtime.topic() LIKE 'user:' || auth.uid()::text || ':%')
    OR (realtime.topic() LIKE 'private:' || auth.uid()::text || ':%')
  );

-- 9) SECURITY DEFINER function EXECUTE hardening
-- Trigger-only / internal functions: revoke from anon + authenticated (only invoked by triggers or service_role)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_unlike() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.award_gift_light_score() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_gift_received() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_testimonial_approved() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_testimonial_comment() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_testimonial_like() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_comment_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_follow_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_like_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_message_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_reaction_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_save_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_moment_reactions_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_testimonial_comments_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_testimonial_likes_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_universe_message_comments_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_security_event(text, text, uuid, text, text, text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_share_view(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_shared_conversation_by_share_id(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_service_role() FROM anon, authenticated, PUBLIC;

-- Admin-only stats: revoke from anon (function itself checks admin role)
REVOKE EXECUTE ON FUNCTION public.get_admin_event_stats(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_security_stats(integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_behavior_stats(integer) FROM anon, PUBLIC;

-- Auth-only RPCs: revoke from anon
REVOKE EXECUTE ON FUNCTION public.search_users_safe(text, integer, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.soft_delete_message(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_presence_safe(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_profile_safe(uuid) FROM anon, PUBLIC;
