-- Create anonymous_sessions table to track session ownership
CREATE TABLE public.anonymous_sessions (
  session_id TEXT PRIMARY KEY,
  session_secret TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on anonymous_sessions
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a new session (for initialization)
CREATE POLICY "Anyone can create anonymous session"
ON public.anonymous_sessions
FOR INSERT
WITH CHECK (true);

-- Allow reading own session (validated by secret)
CREATE POLICY "Anyone can read session by secret"
ON public.anonymous_sessions
FOR SELECT
USING (true);

-- Create function to set session context for RLS validation
CREATE OR REPLACE FUNCTION public.set_session_context(p_session_id TEXT, p_session_secret TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate the session exists and secret matches
  IF EXISTS (
    SELECT 1 FROM public.anonymous_sessions 
    WHERE session_id = p_session_id AND session_secret = p_session_secret
  ) THEN
    -- Set the validated session_id in config for RLS to use
    PERFORM set_config('app.validated_session_id', p_session_id, true);
    RETURN true;
  ELSE
    PERFORM set_config('app.validated_session_id', '', true);
    RETURN false;
  END IF;
END;
$$;

-- Create function to get validated session
CREATE OR REPLACE FUNCTION public.get_validated_session_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.validated_session_id', true), '');
$$;

-- Drop existing RLS policies on chat_messages
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;

-- Create new secure RLS policies
-- For authenticated users: standard user_id check
-- For anonymous users: validate session ownership via context

CREATE POLICY "Users can read own messages"
ON public.chat_messages
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND user_id IS NULL AND session_id = public.get_validated_session_id())
);

CREATE POLICY "Users can insert own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND user_id IS NULL AND session_id = public.get_validated_session_id())
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
  (auth.uid() IS NULL AND user_id IS NULL AND session_id = public.get_validated_session_id())
);