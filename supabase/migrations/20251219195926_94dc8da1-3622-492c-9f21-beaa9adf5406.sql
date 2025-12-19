-- Create private messages table
CREATE TABLE public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for private messages
CREATE POLICY "Users can view their own messages"
ON public.private_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages to friends"
ON public.private_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND sender_id != receiver_id
  AND EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE status = 'accepted' 
    AND (
      (requester_id = auth.uid() AND addressee_id = receiver_id)
      OR (addressee_id = auth.uid() AND requester_id = receiver_id)
    )
  )
);

CREATE POLICY "Receiver can mark messages as read"
ON public.private_messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own sent messages"
ON public.private_messages FOR DELETE
USING (auth.uid() = sender_id);

-- Create user presence table for online status
CREATE TABLE public.user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for presence
CREATE POLICY "Anyone can view presence"
ON public.user_presence FOR SELECT
USING (true);

CREATE POLICY "Users can insert own presence"
ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for private messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;

-- Enable realtime for presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;