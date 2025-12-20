-- Create visibility enum type for AI conversations
CREATE TYPE public.chat_visibility AS ENUM ('private', 'public', 'unlisted');

-- Add visibility column to chat_messages with default 'private'
ALTER TABLE public.chat_messages 
ADD COLUMN visibility public.chat_visibility NOT NULL DEFAULT 'private';

-- Add public_consent column to track explicit user consent for sharing
ALTER TABLE public.chat_messages 
ADD COLUMN public_consent boolean NOT NULL DEFAULT false;

-- Drop existing RLS policies that allow anonymous access
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;

-- Create strict privacy-first RLS policies
-- Only authenticated users can access their own messages
CREATE POLICY "Authenticated users can read own private messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Only authenticated users can insert messages
CREATE POLICY "Authenticated users can insert own messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Only authenticated users can update their own messages
CREATE POLICY "Authenticated users can update own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Only authenticated users can delete their own messages
CREATE POLICY "Authenticated users can delete own messages" 
ON public.chat_messages 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Update user_presence to only be visible to authenticated users
DROP POLICY IF EXISTS "Anyone can view presence" ON public.user_presence;

CREATE POLICY "Authenticated users can view presence" 
ON public.user_presence 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add index for visibility column for performance
CREATE INDEX idx_chat_messages_visibility ON public.chat_messages(visibility);

-- Add index for user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);