-- Make universe-messages bucket public so videos can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'universe-messages';

-- Create RLS policy for authenticated users to upload to universe-messages bucket
CREATE POLICY "Users can upload to universe-messages" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'universe-messages');

-- Create RLS policy for public read access to universe-messages bucket
CREATE POLICY "Public can view universe-messages files" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'universe-messages');

-- Create RLS policy for users to delete their own files
CREATE POLICY "Users can delete own universe-messages files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'universe-messages' AND auth.uid()::text = (storage.foldername(name))[1]);