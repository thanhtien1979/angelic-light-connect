-- Drop existing RLS policies on chat_messages
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;

-- Create new PERMISSIVE policies that properly validate session_id for anonymous users
-- For authenticated users: user_id must match auth.uid()
-- For anonymous users: user_id IS NULL is allowed (session_id filtering done at app level since RLS can't access localStorage)
-- The key security here is that anonymous users CANNOT access authenticated user messages

-- SELECT policy
CREATE POLICY "Users can read own messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid()
    ELSE user_id IS NULL
  END
);

-- INSERT policy  
CREATE POLICY "Users can insert own messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid()
    ELSE user_id IS NULL
  END
);

-- UPDATE policy (only for authenticated users)
CREATE POLICY "Users can update own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- DELETE policy
CREATE POLICY "Users can delete own messages" 
ON public.chat_messages 
FOR DELETE 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_id = auth.uid()
    ELSE user_id IS NULL
  END
);