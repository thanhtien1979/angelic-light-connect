-- Tạo bảng profile_views để theo dõi lượt xem profile
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  viewer_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can insert views (when they view someone's profile)
CREATE POLICY "Users can log profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id AND viewer_id != profile_id);

-- Users can see who viewed their profile
CREATE POLICY "Users can see their profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = profile_id);

-- Add notify_profile_views column to privacy_settings
ALTER TABLE public.privacy_settings 
ADD COLUMN IF NOT EXISTS notify_profile_views boolean NOT NULL DEFAULT true;

-- Create indexes for efficient queries
CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_viewer_id ON public.profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at DESC);