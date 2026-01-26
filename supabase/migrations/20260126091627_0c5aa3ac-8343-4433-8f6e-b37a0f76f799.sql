-- =============================================
-- NINE PATH (Bản đồ 9) MODULE SCHEMA
-- =============================================

-- Enum for verification levels
CREATE TYPE public.nine_path_verification_level AS ENUM ('self_claim', 'proof', 'community_witness', 'impact_verified');

-- Enum for task categories
CREATE TYPE public.nine_path_task_category AS ENUM ('healing', 'awakening', 'service');

-- =============================================
-- USER NINE PATH PROFILE
-- =============================================
CREATE TABLE public.nine_path_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_answers JSONB DEFAULT NULL,
  current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage >= 1 AND current_stage <= 9),
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.nine_path_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own nine path profile" ON public.nine_path_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nine path profile" ON public.nine_path_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nine path profile" ON public.nine_path_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- STAGE DEFINITIONS (Static reference data)
-- =============================================
CREATE TABLE public.nine_path_stages (
  id INTEGER PRIMARY KEY CHECK (id >= 1 AND id <= 9),
  name_vi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_vi TEXT NOT NULL,
  description_en TEXT NOT NULL,
  theme_color TEXT NOT NULL DEFAULT '#FFD700',
  icon TEXT NOT NULL DEFAULT '✨',
  healing_focus TEXT,
  awakening_focus TEXT,
  service_focus TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nine_path_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Anyone can read stages
CREATE POLICY "Anyone can view stages" ON public.nine_path_stages
  FOR SELECT USING (true);

-- Insert 9 stages
INSERT INTO public.nine_path_stages (id, name_vi, name_en, description_vi, description_en, theme_color, icon, healing_focus, awakening_focus, service_focus) VALUES
(1, 'Khởi Nguyên', 'Origin', 'Chặng khám phá bản thân, hiểu rõ gốc rễ và tiềm năng nội tại', 'The stage of self-discovery, understanding roots and inner potential', '#FF6B6B', '🌱', 'Chữa lành inner child', 'Nhận ra tiềm năng bản thân', 'Giúp đỡ người mới bắt đầu'),
(2, 'Kết Nối', 'Connection', 'Chặng xây dựng mối quan hệ lành mạnh và cân bằng', 'The stage of building healthy and balanced relationships', '#4ECDC4', '🤝', 'Chữa lành các mối quan hệ', 'Hiểu về sự đồng cảm', 'Kết nối cộng đồng'),
(3, 'Biểu Hiện', 'Expression', 'Chặng thể hiện sáng tạo và giao tiếp chân thật', 'The stage of creative expression and authentic communication', '#FFE66D', '🎨', 'Giải phóng cảm xúc', 'Phát triển sáng tạo', 'Chia sẻ nghệ thuật'),
(4, 'Nền Tảng', 'Foundation', 'Chặng xây dựng sự ổn định và an toàn', 'The stage of building stability and security', '#95E1D3', '🏠', 'Chữa lành tài chính', 'Xây dựng kỷ luật', 'Tạo môi trường an toàn'),
(5, 'Chuyển Hóa', 'Transformation', 'Chặng thay đổi sâu sắc và tự do', 'The stage of profound change and freedom', '#F38181', '🦋', 'Giải phóng nỗi sợ', 'Chấp nhận thay đổi', 'Hướng dẫn chuyển đổi'),
(6, 'Trách Nhiệm', 'Responsibility', 'Chặng yêu thương vô điều kiện và phụng sự', 'The stage of unconditional love and service', '#AA96DA', '💜', 'Chữa lành gia đình', 'Học yêu vô điều kiện', 'Phục vụ cộng đồng'),
(7, 'Chiêm Nghiệm', 'Reflection', 'Chặng tĩnh lặng, chiêm nghiệm và trí tuệ nội tại', 'The stage of stillness, contemplation and inner wisdom', '#7B68EE', '🔮', 'Thiền định sâu', 'Kết nối trực giác', 'Hướng dẫn tâm linh'),
(8, 'Thịnh Vượng', 'Abundance', 'Chặng thịnh vượng vật chất và tinh thần', 'The stage of material and spiritual abundance', '#FFD93D', '👑', 'Chữa lành mindset khan hiếm', 'Nhận ra sự dư dả', 'Chia sẻ tài nguyên'),
(9, 'Hoàn Thành', 'Completion', 'Chặng hoàn thiện, tổng hợp và cống hiến cao nhất', 'The stage of completion, synthesis and highest contribution', '#C9B1FF', '🌟', 'Buông bỏ attachment', 'Đạt được sự viên mãn', 'Mentor thế hệ sau');

-- =============================================
-- DAILY TASKS
-- =============================================
CREATE TABLE public.nine_path_daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL REFERENCES public.nine_path_stages(id),
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category nine_path_task_category NOT NULL,
  task_title TEXT NOT NULL,
  task_description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  verification_level nine_path_verification_level DEFAULT 'self_claim',
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nine_path_daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tasks" ON public.nine_path_daily_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.nine_path_daily_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.nine_path_daily_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TASK PROOFS
-- =============================================
CREATE TABLE public.nine_path_task_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.nine_path_daily_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proof_text TEXT,
  image_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  verification_level nine_path_verification_level NOT NULL DEFAULT 'proof',
  community_votes INTEGER DEFAULT 0,
  required_votes INTEGER DEFAULT 3,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nine_path_task_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own proofs" ON public.nine_path_task_proofs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view proofs pending verification" ON public.nine_path_task_proofs
  FOR SELECT USING (
    verification_level = 'community_witness' 
    AND is_verified = false
    AND auth.uid() IS NOT NULL
    AND auth.uid() != user_id
  );

CREATE POLICY "Users can insert own proofs" ON public.nine_path_task_proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proofs" ON public.nine_path_task_proofs
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- COMMUNITY VOTES
-- =============================================
CREATE TABLE public.nine_path_community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID NOT NULL REFERENCES public.nine_path_task_proofs(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('approve', 'reject')),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(proof_id, voter_id)
);

-- Enable RLS
ALTER TABLE public.nine_path_community_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own votes" ON public.nine_path_community_votes
  FOR SELECT USING (auth.uid() = voter_id);

CREATE POLICY "Users can vote on proofs" ON public.nine_path_community_votes
  FOR INSERT WITH CHECK (
    auth.uid() = voter_id 
    AND EXISTS (
      SELECT 1 FROM public.nine_path_task_proofs 
      WHERE id = proof_id AND user_id != auth.uid()
    )
  );

-- =============================================
-- STAGE CHECKLIST ITEMS
-- =============================================
CREATE TABLE public.nine_path_stage_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL REFERENCES public.nine_path_stages(id),
  item_title TEXT NOT NULL,
  item_description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nine_path_stage_checklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own checklist" ON public.nine_path_stage_checklist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist items" ON public.nine_path_stage_checklist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist items" ON public.nine_path_stage_checklist
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_nine_path_profiles_user ON public.nine_path_profiles(user_id);
CREATE INDEX idx_nine_path_daily_tasks_user_date ON public.nine_path_daily_tasks(user_id, task_date);
CREATE INDEX idx_nine_path_task_proofs_task ON public.nine_path_task_proofs(task_id);
CREATE INDEX idx_nine_path_task_proofs_verification ON public.nine_path_task_proofs(verification_level, is_verified) WHERE is_verified = false;
CREATE INDEX idx_nine_path_community_votes_proof ON public.nine_path_community_votes(proof_id);
CREATE INDEX idx_nine_path_stage_checklist_user_stage ON public.nine_path_stage_checklist(user_id, stage_id);

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_nine_path_profiles_updated_at
  BEFORE UPDATE ON public.nine_path_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nine_path_daily_tasks_updated_at
  BEFORE UPDATE ON public.nine_path_daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nine_path_task_proofs_updated_at
  BEFORE UPDATE ON public.nine_path_task_proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();