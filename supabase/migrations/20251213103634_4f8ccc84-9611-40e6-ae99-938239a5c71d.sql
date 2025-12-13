-- First drop RLS policies that depend on the function
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;

-- Now drop the functions and table
DROP FUNCTION IF EXISTS public.set_session_context(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_validated_session_id();
DROP TABLE IF EXISTS public.anonymous_sessions;

-- Create simplified secure RLS policies
-- Authenticated users: use user_id
-- Anonymous users: filter by session_id in query (the 64-char random session_id in localStorage is the secret)

CREATE POLICY "Users can read own messages"
ON public.chat_messages
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can insert own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can update own messages"
ON public.chat_messages
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

CREATE POLICY "Users can delete own messages"
ON public.chat_messages
FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND user_id IS NULL)
);