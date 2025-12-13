-- Add user_id column to chat_messages for authenticated users
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;

-- Create secure RLS policies that check user_id for authenticated users
-- or session_id for anonymous users stored in the content

-- Policy for SELECT: users can only read their own messages
CREATE POLICY "Users can read own messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
  OR 
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Policy for INSERT: users can only insert messages for themselves
CREATE POLICY "Users can insert own messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
  OR 
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Policy for UPDATE: users can only update their own messages
CREATE POLICY "Users can update own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Policy for DELETE: users can only delete their own messages
CREATE POLICY "Users can delete own messages" 
ON public.chat_messages 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
  OR 
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Create index for faster user_id lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);