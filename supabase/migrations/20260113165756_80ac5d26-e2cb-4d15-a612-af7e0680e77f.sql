-- Add avatar_url and video_url columns to angel_bios table
ALTER TABLE public.angel_bios 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create storage bucket for angel media
INSERT INTO storage.buckets (id, name, public)
VALUES ('angel-media', 'angel-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view angel media
CREATE POLICY "Anyone can view angel media"
ON storage.objects FOR SELECT
USING (bucket_id = 'angel-media');

-- Allow authenticated users to upload angel media
CREATE POLICY "Authenticated users can upload angel media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'angel-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update angel media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'angel-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete angel media
CREATE POLICY "Authenticated users can delete angel media"
ON storage.objects FOR DELETE
USING (bucket_id = 'angel-media' AND auth.role() = 'authenticated');