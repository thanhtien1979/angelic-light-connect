-- =====================================================
-- BƯỚC 1: Tạo bảng security_logs để ghi nhật ký bảo mật
-- =====================================================

CREATE TABLE public.security_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'rate_limit', 'failed_auth', 'suspicious_activity', 'data_access'
    event_severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warn', 'error', 'critical'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index để query nhanh
CREATE INDEX idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX idx_security_logs_event_type ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_severity ON public.security_logs(event_severity);

-- Bật RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Chỉ admin mới có thể xem logs
CREATE POLICY "Only admins can view security logs"
    ON public.security_logs
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- Không ai có thể insert trực tiếp (chỉ qua service role từ Edge Functions)
CREATE POLICY "No direct insert to security logs"
    ON public.security_logs
    FOR INSERT
    WITH CHECK (false);

-- =====================================================
-- BƯỚC 2: Thêm cột mã hóa cho mood_entries
-- =====================================================

-- Thêm cột lưu dữ liệu đã mã hóa
ALTER TABLE public.mood_entries 
ADD COLUMN encrypted_data TEXT,
ADD COLUMN encryption_iv TEXT,
ADD COLUMN is_encrypted BOOLEAN DEFAULT false;

-- Comment giải thích
COMMENT ON COLUMN public.mood_entries.encrypted_data IS 'Dữ liệu nhạy cảm đã được mã hóa AES-256-GCM (emotions, note, activities, ai_insight)';
COMMENT ON COLUMN public.mood_entries.encryption_iv IS 'Initialization Vector cho giải mã';
COMMENT ON COLUMN public.mood_entries.is_encrypted IS 'Đánh dấu entry đã được mã hóa chưa';

-- =====================================================
-- BƯỚC 3: Tạo function để ghi security log (cho Edge Functions gọi)
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_event_severity TEXT DEFAULT 'info',
    p_user_id UUID DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_endpoint TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.security_logs (
        event_type,
        event_severity,
        user_id,
        ip_address,
        user_agent,
        endpoint,
        details
    ) VALUES (
        p_event_type,
        p_event_severity,
        p_user_id,
        p_ip_address,
        p_user_agent,
        p_endpoint,
        p_details
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- =====================================================
-- BƯỚC 4: Tạo function thống kê bảo mật cho dashboard
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_security_stats(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_events BIGINT,
    rate_limit_count BIGINT,
    failed_auth_count BIGINT,
    suspicious_count BIGINT,
    critical_count BIGINT,
    unique_ips BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Chỉ admin mới được gọi
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_events,
        COUNT(*) FILTER (WHERE event_type = 'rate_limit')::BIGINT as rate_limit_count,
        COUNT(*) FILTER (WHERE event_type = 'failed_auth')::BIGINT as failed_auth_count,
        COUNT(*) FILTER (WHERE event_type = 'suspicious_activity')::BIGINT as suspicious_count,
        COUNT(*) FILTER (WHERE event_severity = 'critical')::BIGINT as critical_count,
        COUNT(DISTINCT ip_address)::BIGINT as unique_ips
    FROM public.security_logs
    WHERE created_at >= now() - (p_hours || ' hours')::INTERVAL;
END;
$$;

-- Bật realtime cho security_logs (để dashboard cập nhật live)
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_logs;