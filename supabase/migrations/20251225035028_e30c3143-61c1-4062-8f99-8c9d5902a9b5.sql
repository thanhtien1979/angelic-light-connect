-- Create view for public shared light moments without exposing user_id
CREATE OR REPLACE VIEW public.public_shared_light_moments AS
SELECT 
  id,
  display_name,
  moment_type,
  spiritual_message,
  created_at,
  likes_count,
  light_acknowledgement_id
FROM public.shared_light_moments;

-- Create view for public generated images without exposing user_id
CREATE OR REPLACE VIEW public.public_generated_images AS
SELECT 
  id,
  image_url,
  prompt,
  is_public,
  likes_count,
  is_minted,
  token_id,
  created_at
FROM public.generated_images
WHERE is_public = true;

-- Grant access to authenticated and anon users
GRANT SELECT ON public.public_shared_light_moments TO authenticated, anon;
GRANT SELECT ON public.public_generated_images TO authenticated, anon;