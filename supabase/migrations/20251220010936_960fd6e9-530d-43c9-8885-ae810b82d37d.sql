-- Add reply_to_id column to private_messages
ALTER TABLE public.private_messages 
ADD COLUMN reply_to_id UUID REFERENCES public.private_messages(id) ON DELETE SET NULL;

-- Add reply_to_id column to group_messages
ALTER TABLE public.group_messages 
ADD COLUMN reply_to_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_private_messages_reply_to ON public.private_messages(reply_to_id);
CREATE INDEX idx_group_messages_reply_to ON public.group_messages(reply_to_id);