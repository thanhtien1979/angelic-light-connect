-- Fix views to use security_invoker so they inherit RLS from base tables

-- 1. Recreate public_generated_images view with security_invoker
DROP VIEW IF EXISTS public.public_generated_images;
CREATE VIEW public.public_generated_images
WITH (security_invoker=on) AS
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

-- 2. Recreate public_shared_light_moments view with security_invoker  
DROP VIEW IF EXISTS public.public_shared_light_moments;
CREATE VIEW public.public_shared_light_moments
WITH (security_invoker=on) AS
SELECT 
    id,
    display_name,
    moment_type,
    spiritual_message,
    created_at,
    likes_count,
    light_acknowledgement_id
FROM public.shared_light_moments;