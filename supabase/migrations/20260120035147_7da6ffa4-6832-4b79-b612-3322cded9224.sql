-- =====================================================
-- A) PREVENT PROFILE SCRAPING
-- =====================================================

-- 1. Create public_profiles view with ONLY safe fields (no sensitive data)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = on) AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  p.created_at,
  -- Include light score as public metric if exists
  COALESCE(lp.light_score, 0) as light_score
FROM public.profiles p
LEFT JOIN public.user_light_profile lp ON lp.user_id = p.id
WHERE 
  -- Only show users who allow public visibility OR have not set privacy (default to friends-only check happens in RLS)
  NOT EXISTS (
    SELECT 1 FROM public.privacy_settings ps 
    WHERE ps.user_id = p.id AND ps.profile_visibility = 'nobody'
  );

-- 2. Create RPC function for safe user search with rate limiting and pagination
CREATE OR REPLACE FUNCTION public.search_users_safe(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  light_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_max_limit INTEGER := 50;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Require authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Require search term (minimum 2 characters)
  IF p_search_term IS NULL OR length(trim(p_search_term)) < 2 THEN
    RAISE EXCEPTION 'Search term must be at least 2 characters';
  END IF;
  
  -- Enforce max limit
  IF p_limit > v_max_limit THEN
    p_limit := v_max_limit;
  END IF;
  
  IF p_limit < 1 THEN
    p_limit := 20;
  END IF;
  
  IF p_offset < 0 THEN
    p_offset := 0;
  END IF;

  -- Rate limit check
  IF NOT public.check_rate_limit(v_user_id::TEXT, 'search_users', 30, 1) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  RETURN QUERY
  SELECT 
    pp.id,
    pp.display_name,
    pp.avatar_url,
    pp.light_score::INTEGER
  FROM public.public_profiles pp
  WHERE 
    pp.display_name ILIKE '%' || trim(p_search_term) || '%'
    AND pp.id != v_user_id
    -- Check if user can view this profile
    AND (
      -- Profile set to everyone
      EXISTS (
        SELECT 1 FROM public.privacy_settings ps 
        WHERE ps.user_id = pp.id AND ps.profile_visibility = 'everyone'
      )
      OR 
      -- No privacy settings (default behavior - show to authenticated)
      NOT EXISTS (
        SELECT 1 FROM public.privacy_settings ps 
        WHERE ps.user_id = pp.id
      )
      OR
      -- Friends visibility - check friendship
      (
        EXISTS (
          SELECT 1 FROM public.privacy_settings ps 
          WHERE ps.user_id = pp.id AND ps.profile_visibility = 'friends'
        )
        AND EXISTS (
          SELECT 1 FROM public.friendships f
          WHERE f.status = 'accepted'
          AND ((f.requester_id = v_user_id AND f.addressee_id = pp.id)
            OR (f.addressee_id = v_user_id AND f.requester_id = pp.id))
        )
      )
    )
    -- Exclude blocked users
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users bu
      WHERE (bu.blocker_id = v_user_id AND bu.blocked_id = pp.id)
        OR (bu.blocker_id = pp.id AND bu.blocked_id = v_user_id)
    )
  ORDER BY pp.display_name
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 3. Create RPC function for leaderboard with rate limiting
CREATE OR REPLACE FUNCTION public.get_leaderboard_safe(
  p_category TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  avatar_url TEXT,
  score BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_max_limit INTEGER := 50;
BEGIN
  -- Get current user (optional for leaderboard)
  v_user_id := auth.uid();
  
  -- Enforce max limit
  IF p_limit > v_max_limit THEN
    p_limit := v_max_limit;
  END IF;
  
  IF p_limit < 1 THEN
    p_limit := 20;
  END IF;

  -- Validate category
  IF p_category NOT IN ('coins', 'meditation', 'moments', 'likes') THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;

  -- Rate limit check (if authenticated)
  IF v_user_id IS NOT NULL THEN
    IF NOT public.check_rate_limit(v_user_id::TEXT, 'leaderboard', 30, 1) THEN
      RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
    END IF;
  END IF;

  CASE p_category
    WHEN 'coins' THEN
      RETURN QUERY
      SELECT 
        pp.id,
        pp.display_name,
        pp.avatar_url,
        COALESCE(uc.lifetime_coins, 0)::BIGINT as score
      FROM public.public_profiles pp
      LEFT JOIN public.user_camly_coins uc ON uc.user_id = pp.id
      WHERE pp.display_name IS NOT NULL
      ORDER BY COALESCE(uc.lifetime_coins, 0) DESC
      LIMIT p_limit;
      
    WHEN 'meditation' THEN
      RETURN QUERY
      SELECT 
        pp.id,
        pp.display_name,
        pp.avatar_url,
        COALESCE(SUM(mh.duration_seconds) / 60, 0)::BIGINT as score
      FROM public.public_profiles pp
      LEFT JOIN public.meditation_history mh ON mh.user_id = pp.id
      WHERE pp.display_name IS NOT NULL
      GROUP BY pp.id, pp.display_name, pp.avatar_url
      ORDER BY score DESC
      LIMIT p_limit;
      
    WHEN 'moments' THEN
      RETURN QUERY
      SELECT 
        pp.id,
        pp.display_name,
        pp.avatar_url,
        COUNT(slm.id)::BIGINT as score
      FROM public.public_profiles pp
      LEFT JOIN public.shared_light_moments slm ON slm.user_id = pp.id
      WHERE pp.display_name IS NOT NULL
      GROUP BY pp.id, pp.display_name, pp.avatar_url
      ORDER BY score DESC
      LIMIT p_limit;
      
    WHEN 'likes' THEN
      RETURN QUERY
      SELECT 
        pp.id,
        pp.display_name,
        pp.avatar_url,
        COALESCE(SUM(slm.likes_count), 0)::BIGINT as score
      FROM public.public_profiles pp
      LEFT JOIN public.shared_light_moments slm ON slm.user_id = pp.id
      WHERE pp.display_name IS NOT NULL
      GROUP BY pp.id, pp.display_name, pp.avatar_url
      ORDER BY score DESC
      LIMIT p_limit;
  END CASE;
END;
$$;

-- =====================================================
-- B) ONLINE STATUS CONSENT - Add online_visible column
-- =====================================================

-- Add online_visible column to privacy_settings (defaults to false - opt-in)
ALTER TABLE public.privacy_settings 
ADD COLUMN IF NOT EXISTS online_visible BOOLEAN DEFAULT false;

-- Update can_view_online_status to respect online_visible consent
CREATE OR REPLACE FUNCTION public.can_view_online_status(viewer_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      -- User can always see their own status
      WHEN viewer_id = target_user_id THEN true
      -- Anonymous users cannot see online status
      WHEN viewer_id IS NULL THEN false
      ELSE COALESCE(
        (
          SELECT 
            -- First check if online_visible is explicitly enabled
            CASE 
              WHEN ps.online_visible = false THEN false
              ELSE
                CASE ps.online_status_visibility
                  WHEN 'everyone' THEN true
                  WHEN 'friends' THEN EXISTS (
                    SELECT 1 FROM friendships 
                    WHERE status = 'accepted' 
                    AND ((requester_id = viewer_id AND addressee_id = target_user_id)
                      OR (addressee_id = viewer_id AND requester_id = target_user_id))
                  )
                  WHEN 'nobody' THEN false
                  ELSE false
                END
            END
          FROM privacy_settings ps
          WHERE ps.user_id = target_user_id
        ),
        -- Default: online status hidden (opt-in required)
        false
      )
    END
$$;

-- Create RPC function to get user presence with privacy check
CREATE OR REPLACE FUNCTION public.get_user_presence_safe(p_target_user_id UUID)
RETURNS TABLE(
  is_online BOOLEAN,
  last_seen TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_viewer_id UUID;
BEGIN
  v_viewer_id := auth.uid();
  
  -- Check if viewer can see online status
  IF NOT public.can_view_online_status(v_viewer_id, p_target_user_id) THEN
    -- Return NULL values instead of raising exception
    RETURN QUERY SELECT NULL::BOOLEAN, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check if show_last_seen is enabled
  RETURN QUERY
  SELECT 
    up.is_online,
    CASE 
      WHEN COALESCE(
        (SELECT ps.show_last_seen FROM public.privacy_settings ps WHERE ps.user_id = p_target_user_id),
        false
      ) THEN up.last_seen
      ELSE NULL
    END as last_seen
  FROM public.user_presence up
  WHERE up.user_id = p_target_user_id;
END;
$$;

-- =====================================================
-- C) PROTECT BEHAVIOR TRACKING DATA
-- =====================================================

-- Use existing roles (admin) for now, add tier logic via functions
-- Note: Adding new enum values requires separate transaction, will be done in next migration

-- Update RLS policies for light_behaviors table
DROP POLICY IF EXISTS "Users can view own behaviors" ON public.light_behaviors;
DROP POLICY IF EXISTS "Only auditors can view all behaviors" ON public.light_behaviors;
DROP POLICY IF EXISTS "Service role can insert behaviors" ON public.light_behaviors;
DROP POLICY IF EXISTS "Auditors can view all behaviors" ON public.light_behaviors;
DROP POLICY IF EXISTS "Service role insert behaviors" ON public.light_behaviors;
DROP POLICY IF EXISTS "Admins can view all behaviors" ON public.light_behaviors;

CREATE POLICY "Users can view own behaviors" 
ON public.light_behaviors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all behaviors" 
ON public.light_behaviors 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role insert behaviors" 
ON public.light_behaviors 
FOR INSERT 
WITH CHECK (
  public.is_service_role() 
  OR auth.uid() = user_id
);

-- Update RLS policies for security_logs table
DROP POLICY IF EXISTS "Only admins can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Only auditors can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Service role can insert security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Auditors can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Service role insert security logs" ON public.security_logs;

CREATE POLICY "Admins can view security logs" 
ON public.security_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role insert security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (public.is_service_role());

-- Create aggregated admin dashboard view (no user-level detail)
DROP VIEW IF EXISTS public.admin_event_aggregates;
CREATE VIEW public.admin_event_aggregates AS
SELECT 
  date_trunc('day', created_at) as event_date,
  event_type,
  event_severity,
  COUNT(*) as event_count
FROM public.security_logs
GROUP BY date_trunc('day', created_at), event_type, event_severity
ORDER BY event_date DESC, event_count DESC;

-- Create RPC function for admins to access aggregated event stats
CREATE OR REPLACE FUNCTION public.get_admin_event_stats(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  event_date DATE,
  event_type TEXT,
  event_severity TEXT,
  event_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY
  SELECT 
    date_trunc('day', sl.created_at)::DATE as event_date,
    sl.event_type,
    sl.event_severity,
    COUNT(*)::BIGINT as event_count
  FROM public.security_logs sl
  WHERE sl.created_at >= (now() - (p_days || ' days')::INTERVAL)
  GROUP BY date_trunc('day', sl.created_at), sl.event_type, sl.event_severity
  ORDER BY event_date DESC, event_count DESC;
END;
$$;

-- Create aggregated behavior stats for admins (no raw user data)
CREATE OR REPLACE FUNCTION public.get_behavior_stats(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  behavior_date DATE,
  behavior_type TEXT,
  energy_type TEXT,
  behavior_count BIGINT,
  avg_sentiment NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  RETURN QUERY
  SELECT 
    date_trunc('day', lb.analyzed_at)::DATE as behavior_date,
    lb.behavior_type,
    lb.energy_type,
    COUNT(*)::BIGINT as behavior_count,
    ROUND(AVG(lb.sentiment_score), 2) as avg_sentiment
  FROM public.light_behaviors lb
  WHERE lb.analyzed_at >= (now() - (p_days || ' days')::INTERVAL)
  GROUP BY date_trunc('day', lb.analyzed_at), lb.behavior_type, lb.energy_type
  ORDER BY behavior_date DESC, behavior_count DESC;
END;
$$;