-- Fix security issues: Require authentication for all user data tables

-- 1. Universe Messages - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view universe messages" ON public.universe_messages;
CREATE POLICY "Authenticated users can view universe messages" 
ON public.universe_messages 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Universe Message Comments - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view comments" ON public.universe_message_comments;
CREATE POLICY "Authenticated users can view comments" 
ON public.universe_message_comments 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Universe Message Likes - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view likes" ON public.universe_message_likes;
CREATE POLICY "Authenticated users can view likes" 
ON public.universe_message_likes 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Universe Message Comment Reactions - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view comment reactions" ON public.universe_message_comment_reactions;
CREATE POLICY "Authenticated users can view comment reactions" 
ON public.universe_message_comment_reactions 
FOR SELECT 
TO authenticated
USING (true);

-- 5. Shared Conversations - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view active shared conversations" ON public.shared_conversations;
CREATE POLICY "Authenticated users can view active shared conversations" 
ON public.shared_conversations 
FOR SELECT 
TO authenticated
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- 6. User Testimonial Badges - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_testimonial_badges;
CREATE POLICY "Authenticated users can view badges" 
ON public.user_testimonial_badges 
FOR SELECT 
TO authenticated
USING (true);

-- 7. Testimonial Tags - require authentication for SELECT  
DROP POLICY IF EXISTS "Anyone can view testimonial tags" ON public.testimonial_tags;
CREATE POLICY "Authenticated users can view testimonial tags" 
ON public.testimonial_tags 
FOR SELECT 
TO authenticated
USING (true);

-- 8. Angel Bios - require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can view angel bios" ON public.angel_bios;
CREATE POLICY "Authenticated users can view angel bios" 
ON public.angel_bios 
FOR SELECT 
TO authenticated
USING (true);