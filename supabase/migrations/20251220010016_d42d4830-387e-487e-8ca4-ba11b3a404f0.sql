-- Create group_chats table
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  sticker_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add sticker_id to private_messages table
ALTER TABLE public.private_messages ADD COLUMN sticker_id TEXT;

-- Enable RLS on all tables
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Unique constraint for group membership
CREATE UNIQUE INDEX idx_group_members_unique ON public.group_members(group_id, user_id);

-- RLS Policies for group_chats
CREATE POLICY "Users can view groups they are members of" 
ON public.group_chats 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_chats.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create groups" 
ON public.group_chats 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" 
ON public.group_chats 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_chats.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
  )
);

CREATE POLICY "Group admins can delete groups" 
ON public.group_chats 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can view group members" 
ON public.group_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can add members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.group_chats gc 
    WHERE gc.id = group_members.group_id 
    AND gc.created_by = auth.uid()
  )
);

CREATE POLICY "Group admins can remove members" 
ON public.group_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
  OR auth.uid() = user_id
);

-- RLS Policies for group_messages
CREATE POLICY "Group members can view messages" 
ON public.group_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own messages" 
ON public.group_messages 
FOR DELETE 
USING (auth.uid() = sender_id);

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Trigger for updated_at on group_chats
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();