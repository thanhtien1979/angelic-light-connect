-- Add image_url column to private_messages
ALTER TABLE public.private_messages
ADD COLUMN image_url TEXT DEFAULT NULL;

-- Create typing_status table for realtime typing indicator
CREATE TABLE public.typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chat_partner_id)
);

-- Enable RLS
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for typing status
CREATE POLICY "Users can view typing status for their chats"
ON public.typing_status FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = chat_partner_id);

CREATE POLICY "Users can insert own typing status"
ON public.typing_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own typing status"
ON public.typing_status FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own typing status"
ON public.typing_status FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for typing status
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_status;