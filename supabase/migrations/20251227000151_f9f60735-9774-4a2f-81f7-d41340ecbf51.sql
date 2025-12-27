-- ================================================
-- FIX 1 & 2: Add consent verification for public data
-- ================================================

-- Add public_consent_confirmed to reflection_notes
ALTER TABLE public.reflection_notes 
ADD COLUMN IF NOT EXISTS public_consent_confirmed boolean NOT NULL DEFAULT false;

-- Add public_consent_confirmed to light_acknowledgements  
ALTER TABLE public.light_acknowledgements
ADD COLUMN IF NOT EXISTS public_consent_confirmed boolean NOT NULL DEFAULT false;

-- Drop and recreate SELECT policy for reflection_notes with consent requirement
DROP POLICY IF EXISTS "Users can view own or public reflections" ON public.reflection_notes;

CREATE POLICY "Users can view own or consented public reflections"
ON public.reflection_notes
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR (is_public = true AND public_consent_confirmed = true AND approved = true)
);

-- Drop and recreate SELECT policy for light_acknowledgements with consent requirement
DROP POLICY IF EXISTS "Users can view own or public acknowledgements" ON public.light_acknowledgements;

CREATE POLICY "Users can view own or consented public acknowledgements"
ON public.light_acknowledgements
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR (is_public = true AND public_consent_confirmed = true)
);

-- ================================================
-- FIX 3: Restrict rate_limits to service role only via function
-- ================================================

-- Create a security definer function to check service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true) = 'service_role',
    current_user = 'service_role'
  )
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create stricter policy using the function
CREATE POLICY "Only service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (public.is_service_role())
WITH CHECK (public.is_service_role());

-- ================================================
-- FIX 4: Require authentication for chat_messages (no anonymous)
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read own private messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can update own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can delete own messages" ON public.chat_messages;

-- Recreate with stricter checks (user_id must match and not be null)
CREATE POLICY "Users can read own messages"
ON public.chat_messages
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own messages"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
ON public.chat_messages
FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

-- ================================================
-- FIX 5: Require authentication for conversation_summaries (no anonymous)
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own summaries" ON public.conversation_summaries;
DROP POLICY IF EXISTS "Users can create their own summaries" ON public.conversation_summaries;
DROP POLICY IF EXISTS "Users can update their own summaries" ON public.conversation_summaries;
DROP POLICY IF EXISTS "Users can delete their own summaries" ON public.conversation_summaries;

-- Recreate with stricter checks (require authentication, no anonymous)
CREATE POLICY "Authenticated users can view own summaries"
ON public.conversation_summaries
FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can create own summaries"
ON public.conversation_summaries
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can update own summaries"
ON public.conversation_summaries
FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own summaries"
ON public.conversation_summaries
FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());