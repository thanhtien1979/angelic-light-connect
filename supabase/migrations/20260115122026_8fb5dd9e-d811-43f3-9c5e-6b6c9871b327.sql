-- Drop the insecure policy that allows any authenticated user to view all shared conversations
DROP POLICY IF EXISTS "Authenticated users can view active shared conversations" ON public.shared_conversations;

-- Create secure policy: Only owner can list/view their own conversations via direct query
CREATE POLICY "Only owner can view own shared conversations"
  ON public.shared_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a secure function to get shared conversation by share_id (for public access via edge function)
CREATE OR REPLACE FUNCTION public.get_shared_conversation_by_share_id(p_share_id TEXT)
RETURNS TABLE (
  id UUID,
  share_id TEXT,
  user_id UUID,
  title TEXT,
  messages JSONB,
  visibility TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  view_count INTEGER,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return if active and not expired
  RETURN QUERY
  SELECT 
    sc.id,
    sc.share_id,
    sc.user_id,
    sc.title,
    sc.messages,
    sc.visibility::TEXT,
    sc.created_at,
    sc.expires_at,
    sc.view_count,
    sc.is_active
  FROM public.shared_conversations sc
  WHERE sc.share_id = p_share_id
    AND sc.is_active = true
    AND (sc.expires_at IS NULL OR sc.expires_at > now());
    
  -- Increment view count
  UPDATE public.shared_conversations
  SET view_count = view_count + 1
  WHERE shared_conversations.share_id = p_share_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
END;
$$;