-- Create universe_messages table for "Thông Điệp Của Cha Vũ Trụ" feature
CREATE TABLE public.universe_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_urls TEXT[] NULL,
  video_url TEXT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create universe_message_likes table for tracking likes
CREATE TABLE public.universe_message_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.universe_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.universe_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_message_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for universe_messages
CREATE POLICY "Anyone can view universe messages"
ON public.universe_messages
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create universe messages"
ON public.universe_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.universe_messages
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.universe_messages
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for universe_message_likes
CREATE POLICY "Anyone can view likes"
ON public.universe_message_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like messages"
ON public.universe_message_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
ON public.universe_message_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.universe_messages;

-- Create storage bucket for universe messages media
INSERT INTO storage.buckets (id, name, public)
VALUES ('universe-messages', 'universe-messages', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for universe-messages bucket
CREATE POLICY "Anyone can view universe message files"
ON storage.objects FOR SELECT
USING (bucket_id = 'universe-messages');

CREATE POLICY "Authenticated users can upload universe message files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'universe-messages' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own universe message files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'universe-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own universe message files"
ON storage.objects FOR DELETE
USING (bucket_id = 'universe-messages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for updated_at
CREATE TRIGGER update_universe_messages_updated_at
BEFORE UPDATE ON public.universe_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();