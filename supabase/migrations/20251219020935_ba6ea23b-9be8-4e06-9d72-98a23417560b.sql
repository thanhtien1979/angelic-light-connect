-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Create storage policies for generated-images bucket
CREATE POLICY "Anyone can view generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to store image metadata
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own or public images"
ON public.generated_images FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own images"
ON public.generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
ON public.generated_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
ON public.generated_images FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_public ON public.generated_images(is_public) WHERE is_public = true;