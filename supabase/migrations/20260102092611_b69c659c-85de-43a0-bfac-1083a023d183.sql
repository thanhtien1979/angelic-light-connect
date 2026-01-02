-- Create storage bucket for custom angel cursor videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('angel-cursor-videos', 'angel-cursor-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own angel videos
CREATE POLICY "Users can upload their own angel videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'angel-cursor-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own angel videos
CREATE POLICY "Users can update their own angel videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'angel-cursor-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own angel videos
CREATE POLICY "Users can delete their own angel videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'angel-cursor-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for angel videos
CREATE POLICY "Angel cursor videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'angel-cursor-videos');

-- Add custom video URL column to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS angel_cursor_video_url TEXT DEFAULT NULL;