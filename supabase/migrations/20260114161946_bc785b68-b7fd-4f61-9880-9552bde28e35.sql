-- Create universe_message_comments table
CREATE TABLE public.universe_message_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.universe_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.universe_message_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create universe_message_comment_reactions table
CREATE TABLE public.universe_message_comment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.universe_message_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Add comments_count to universe_messages
ALTER TABLE public.universe_messages ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.universe_message_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_message_comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Anyone can view comments" ON public.universe_message_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.universe_message_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.universe_message_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.universe_message_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for reactions
CREATE POLICY "Anyone can view comment reactions" ON public.universe_message_comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reactions" ON public.universe_message_comment_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.universe_message_comment_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.universe_message_comment_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update comments_count
CREATE OR REPLACE FUNCTION public.update_universe_message_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.universe_messages 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.message_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.universe_messages 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.message_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for comments count
CREATE TRIGGER update_universe_message_comments_count_trigger
AFTER INSERT OR DELETE ON public.universe_message_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_universe_message_comments_count();

-- Function to update comment updated_at
CREATE OR REPLACE FUNCTION public.update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updated_at
CREATE TRIGGER update_universe_message_comments_updated_at
BEFORE UPDATE ON public.universe_message_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comment_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.universe_message_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.universe_message_comment_reactions;