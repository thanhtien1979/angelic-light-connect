-- Create shared_conversations table for storing conversation snapshots
CREATE TABLE public.shared_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    share_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    messages JSONB NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'unlisted' CHECK (visibility IN ('unlisted', 'public')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for fast lookups by share_id
CREATE INDEX idx_shared_conversations_share_id ON public.shared_conversations(share_id);
CREATE INDEX idx_shared_conversations_user_id ON public.shared_conversations(user_id);

-- Enable RLS
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own shared conversations
CREATE POLICY "Users can create their own shared conversations"
ON public.shared_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own shared conversations
CREATE POLICY "Users can view their own shared conversations"
ON public.shared_conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own shared conversations (e.g., revoke)
CREATE POLICY "Users can update their own shared conversations"
ON public.shared_conversations
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own shared conversations
CREATE POLICY "Users can delete their own shared conversations"
ON public.shared_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Anyone can view active shared conversations (for public share links)
CREATE POLICY "Anyone can view active shared conversations"
ON public.shared_conversations
FOR SELECT
USING (is_active = true);