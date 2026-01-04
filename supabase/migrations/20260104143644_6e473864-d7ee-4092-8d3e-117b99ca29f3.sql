-- Add view tracking columns to shared_conversations
ALTER TABLE public.shared_conversations 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_share_view(p_share_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.shared_conversations
  SET view_count = view_count + 1,
      last_viewed_at = now()
  WHERE share_id = p_share_id 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
END;
$$;