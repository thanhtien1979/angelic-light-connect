-- 1. Tạo bảng privacy_settings
CREATE TABLE public.privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  profile_visibility text NOT NULL DEFAULT 'friends' 
    CHECK (profile_visibility IN ('everyone', 'friends', 'nobody')),
  online_status_visibility text NOT NULL DEFAULT 'friends'
    CHECK (online_status_visibility IN ('everyone', 'friends', 'nobody')),
  show_last_seen boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho privacy_settings
CREATE POLICY "Users can view own privacy settings"
  ON public.privacy_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
  ON public.privacy_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
  ON public.privacy_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Security Definer Function để kiểm tra quyền xem profile
CREATE OR REPLACE FUNCTION public.can_view_profile(viewer_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- User can always view their own profile
      WHEN viewer_id = target_user_id THEN true
      WHEN viewer_id IS NULL THEN false
      ELSE COALESCE(
        (
          SELECT CASE ps.profile_visibility
            WHEN 'everyone' THEN true
            WHEN 'friends' THEN EXISTS (
              SELECT 1 FROM friendships 
              WHERE status = 'accepted' 
              AND ((requester_id = viewer_id AND addressee_id = target_user_id)
                OR (addressee_id = viewer_id AND requester_id = target_user_id))
            )
            WHEN 'nobody' THEN false
            ELSE true
          END
          FROM privacy_settings ps
          WHERE ps.user_id = target_user_id
        ),
        -- Default to 'friends' if no settings exist
        EXISTS (
          SELECT 1 FROM friendships 
          WHERE status = 'accepted' 
          AND ((requester_id = viewer_id AND addressee_id = target_user_id)
            OR (addressee_id = viewer_id AND requester_id = target_user_id))
        )
      )
    END
$$;

-- 3. Security Definer Function để kiểm tra quyền xem trạng thái online
CREATE OR REPLACE FUNCTION public.can_view_online_status(viewer_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN viewer_id = target_user_id THEN true
      WHEN viewer_id IS NULL THEN false
      ELSE COALESCE(
        (
          SELECT CASE ps.online_status_visibility
            WHEN 'everyone' THEN true
            WHEN 'friends' THEN EXISTS (
              SELECT 1 FROM friendships 
              WHERE status = 'accepted' 
              AND ((requester_id = viewer_id AND addressee_id = target_user_id)
                OR (addressee_id = viewer_id AND requester_id = target_user_id))
            )
            WHEN 'nobody' THEN false
            ELSE true
          END
          FROM privacy_settings ps
          WHERE ps.user_id = target_user_id
        ),
        -- Default to 'friends' if no settings exist
        EXISTS (
          SELECT 1 FROM friendships 
          WHERE status = 'accepted' 
          AND ((requester_id = viewer_id AND addressee_id = target_user_id)
            OR (addressee_id = viewer_id AND requester_id = target_user_id))
        )
      )
    END
$$;

-- 4. Cập nhật RLS policies cho profiles - xóa policy cũ và tạo mới
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view profiles based on privacy"
  ON profiles FOR SELECT
  USING (public.can_view_profile(auth.uid(), id));

-- 5. Cập nhật RLS policies cho user_presence
DROP POLICY IF EXISTS "Authenticated users can view presence" ON user_presence;

CREATE POLICY "Users can view presence based on privacy"
  ON user_presence FOR SELECT
  USING (public.can_view_online_status(auth.uid(), user_id));