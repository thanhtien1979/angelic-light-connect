-- Fix: Add input validation to increment_share_view function to prevent potential abuse
CREATE OR REPLACE FUNCTION public.increment_share_view(p_share_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_viewed TIMESTAMPTZ;
BEGIN
  -- Input validation: alphanumeric, underscore, hyphen only, 8-64 chars
  IF p_share_id IS NULL OR NOT (p_share_id ~ '^[a-zA-Z0-9_-]{8,64}$') THEN
    RAISE EXCEPTION 'Invalid share_id format';
  END IF;

  -- Get the last viewed timestamp
  SELECT last_viewed_at INTO v_last_viewed
  FROM public.shared_conversations
  WHERE share_id = p_share_id;
  
  -- Only increment if not viewed in last 5 minutes (prevents spam)
  IF v_last_viewed IS NULL OR v_last_viewed < (now() - interval '5 minutes') THEN
    UPDATE public.shared_conversations
    SET view_count = view_count + 1,
        last_viewed_at = now()
    WHERE share_id = p_share_id 
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now());
  END IF;
END;
$$;