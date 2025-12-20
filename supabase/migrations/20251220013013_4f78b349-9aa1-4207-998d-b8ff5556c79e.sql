-- Drop all existing policies first then create new ones

-- Drop any existing policies on storage.objects for these buckets
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images to generated-images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Group members can view group images" ON storage.objects;
DROP POLICY IF EXISTS "Group members can view group documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;

-- Now create the new restrictive policies

-- View policies for generated-images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Group members can view group images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-images' AND
  (storage.foldername(name))[1] = 'groups' AND
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = ((storage.foldername(name))[2])::uuid
    AND user_id = auth.uid()
  )
);

-- View policies for documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Group members can view group documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'groups' AND
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = ((storage.foldername(name))[2])::uuid
    AND user_id = auth.uid()
  )
);

-- Upload policies
CREATE POLICY "Users can upload own images to generated-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.uid() IS NOT NULL AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (
      (storage.foldername(name))[1] = 'groups' AND
      EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_id = ((storage.foldername(name))[2])::uuid
        AND user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (
      (storage.foldername(name))[1] = 'groups' AND
      EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_id = ((storage.foldername(name))[2])::uuid
        AND user_id = auth.uid()
      )
    )
  )
);

-- Delete policies
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'generated-images' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);