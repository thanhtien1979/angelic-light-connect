-- Create storage bucket for moment images
INSERT INTO storage.buckets (id, name, public)
VALUES ('moment-images', 'moment-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for moment-images bucket
CREATE POLICY "Anyone can view moment images"
ON storage.objects FOR SELECT
USING (bucket_id = 'moment-images');

CREATE POLICY "Authenticated users can upload moment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'moment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own moment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'moment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to shared_light_moments
ALTER TABLE public.shared_light_moments 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create notifications table for follow and other notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  actor_id UUID,
  reference_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to auto-create notification when someone follows
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_name TEXT;
BEGIN
  -- Get follower's display name
  SELECT display_name INTO follower_name
  FROM public.profiles
  WHERE id = NEW.follower_id;

  -- Create notification for the followed user
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    NEW.following_id,
    'follow',
    'Người theo dõi mới',
    COALESCE(follower_name, 'Một linh hồn') || ' đã bắt đầu theo dõi bạn',
    NEW.follower_id,
    NEW.id::TEXT
  );

  RETURN NEW;
END;
$$;

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS on_new_follow ON public.user_follows;
CREATE TRIGGER on_new_follow
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_notification();