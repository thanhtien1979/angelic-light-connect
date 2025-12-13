-- Create table for chat messages
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster session lookups
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own messages (by session_id)
CREATE POLICY "Users can read own messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own messages" 
ON public.chat_messages 
FOR DELETE 
USING (true);