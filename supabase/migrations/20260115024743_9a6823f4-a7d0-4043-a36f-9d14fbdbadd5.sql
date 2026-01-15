-- Create RPC function to securely fetch shared conversations with rate limiting
-- This function safely retrieves shared conversation data without exposing user_id
-- and includes view count increment and rate limiting logic

CREATE OR REPLACE FUNCTION public.get_shared_conversation(p_share_id text)
RETURNS TABLE (
  id uuid,
  share_id text,
  title text,
  messages jsonb,
  visibility text,
  created_at timestamptz,
  view_count integer
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_conversation_record RECORD;
  v_ip_identifier text;
  v_rate_limit_count integer;
  v_window_start timestamptz;
BEGIN
  -- Get client IP for rate limiting (falls back to session if not available)
  v_ip_identifier := COALESCE(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    gen_random_uuid()::text
  );
  
  -- Check rate limit (10 requests per minute per IP)
  v_window_start := date_trunc('minute', now());
  
  SELECT COUNT(*) INTO v_rate_limit_count
  FROM public.rate_limits
  WHERE identifier = v_ip_identifier
    AND endpoint = 'get_shared_conversation'
    AND window_start >= v_window_start;
  
  IF v_rate_limit_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  -- Insert rate limit record
  INSERT INTO public.rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (v_ip_identifier, 'get_shared_conversation', v_window_start, 1)
  ON CONFLICT (identifier, endpoint, window_start) 
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  -- Fetch the conversation
  SELECT sc.id, sc.share_id, sc.title, sc.messages, sc.visibility, 
         sc.created_at, COALESCE(sc.view_count, 0) as view_count
  INTO v_conversation_record
  FROM public.shared_conversations sc
  WHERE sc.share_id = p_share_id
    AND sc.is_active = true
    AND (sc.expires_at IS NULL OR sc.expires_at > now());
  
  -- Return empty if not found
  IF v_conversation_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Increment view count (separate update to not affect return)
  UPDATE public.shared_conversations
  SET view_count = COALESCE(view_count, 0) + 1,
      last_viewed_at = now()
  WHERE shared_conversations.share_id = p_share_id;
  
  -- Return the result
  RETURN QUERY SELECT 
    v_conversation_record.id,
    v_conversation_record.share_id,
    v_conversation_record.title,
    v_conversation_record.messages,
    v_conversation_record.visibility,
    v_conversation_record.created_at,
    v_conversation_record.view_count;
END;
$$;

-- Add unique constraint for rate limiting if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'rate_limits_unique_identifier_endpoint_window'
  ) THEN
    ALTER TABLE public.rate_limits 
    ADD CONSTRAINT rate_limits_unique_identifier_endpoint_window 
    UNIQUE (identifier, endpoint, window_start);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Constraint already exists
END $$;

-- Grant execute permission to authenticated and anon users (public sharing)
GRANT EXECUTE ON FUNCTION public.get_shared_conversation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_conversation(text) TO anon;