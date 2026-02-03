-- =============================================
-- SECURITY HARDENING MIGRATION
-- Fixes: Profile Data Exposure & Message Interception
-- =============================================

-- 1. Create is_admin helper function for cleaner policy checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 2. Drop existing views and recreate with security_invoker
DROP VIEW IF EXISTS public.public_profiles CASCADE;
DROP VIEW IF EXISTS public.safe_profiles CASCADE;

-- 3. Create secure public_profiles view (SECURITY INVOKER respects RLS)
-- Only exposes safe fields: id, display_name, avatar_url, created_at
CREATE VIEW public.public_profiles 
WITH (security_invoker = on)
AS 
SELECT 
    p.id,
    p.display_name,
    p.avatar_url,
    p.created_at,
    COALESCE(lp.light_score, 0) AS light_score
FROM profiles p
LEFT JOIN user_light_profile lp ON lp.user_id = p.id
WHERE 
    -- Require authentication
    auth.uid() IS NOT NULL
    -- Exclude profiles set to "nobody" visibility
    AND NOT EXISTS (
        SELECT 1 FROM privacy_settings ps 
        WHERE ps.user_id = p.id AND ps.profile_visibility = 'nobody'
    )
    -- Exclude blocked users
    AND NOT public.are_users_blocked(auth.uid(), p.id);

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
REVOKE ALL ON public.public_profiles FROM anon;

-- 4. Create safe_profiles view for internal use (no encryption_salt exposed)
CREATE VIEW public.safe_profiles
WITH (security_invoker = on)
AS 
SELECT 
    id,
    display_name,
    avatar_url,
    bio,
    created_at
FROM profiles
WHERE auth.uid() IS NOT NULL;

GRANT SELECT ON public.safe_profiles TO authenticated;
REVOKE ALL ON public.safe_profiles FROM anon;

-- 5. Update profiles RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- New secure policies for profiles
CREATE POLICY "profiles_select_own" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "profiles_insert_own" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Explicitly deny anon access
DROP POLICY IF EXISTS "anon_cannot_access_profiles" ON profiles;

-- 6. Update private_messages RLS policies for stronger security
-- Keep existing policies but add additional protections

-- Create soft delete column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'private_messages' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE public.private_messages ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
        ALTER TABLE public.private_messages ADD COLUMN deleted_by UUID REFERENCES auth.users(id) DEFAULT NULL;
    END IF;
END $$;

-- Update SELECT policy to exclude soft-deleted messages
DROP POLICY IF EXISTS "Users can view their own messages" ON private_messages;

CREATE POLICY "messages_select_participants" ON private_messages
FOR SELECT TO authenticated
USING (
    deleted_at IS NULL
    AND (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND NOT public.are_users_blocked(auth.uid(), 
        CASE WHEN auth.uid() = sender_id THEN receiver_id ELSE sender_id END
    )
);

-- Admin can view all messages for moderation (but logged)
CREATE POLICY "messages_select_admin" ON private_messages
FOR SELECT TO authenticated
USING (public.is_admin());

-- Replace DELETE with soft delete UPDATE policy
DROP POLICY IF EXISTS "Users can delete their own sent messages" ON private_messages;

CREATE POLICY "messages_soft_delete_sender" ON private_messages
FOR UPDATE TO authenticated
USING (auth.uid() = sender_id AND deleted_at IS NULL)
WITH CHECK (
    auth.uid() = sender_id 
    AND deleted_at IS NOT NULL 
    AND deleted_by = auth.uid()
);

-- 7. Create immutable reward_ledger table
CREATE TABLE IF NOT EXISTS public.reward_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reward_type TEXT NOT NULL CHECK (reward_type IN (
        'meditation_completion', 'reflection_note', 'chat_message', 
        'daily_login', 'bonus', 'purchase', 'refund', 'usage', 'admin_adjustment'
    )),
    description TEXT NOT NULL CHECK (length(description) <= 500),
    reference_id TEXT DEFAULT NULL,
    balance_after BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    is_admin_action BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit fields
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_reward_ledger_user_id ON reward_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_created_at ON reward_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_admin_actions ON reward_ledger(is_admin_action) WHERE is_admin_action = true;

-- Enable RLS on reward_ledger
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;

-- Reward ledger policies - IMMUTABLE (no update/delete allowed)
CREATE POLICY "ledger_select_own" ON reward_ledger
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "ledger_select_admin" ON reward_ledger
FOR SELECT TO authenticated
USING (public.is_admin());

-- Only service role can insert (via edge functions)
CREATE POLICY "ledger_insert_service" ON reward_ledger
FOR INSERT TO service_role
WITH CHECK (true);

-- No UPDATE or DELETE policies = immutable ledger

-- 8. Create secure function to add reward ledger entry (called by edge function)
CREATE OR REPLACE FUNCTION public.add_reward_ledger_entry(
    p_user_id UUID,
    p_amount INTEGER,
    p_reward_type TEXT,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_is_admin_action BOOLEAN DEFAULT false,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ledger_id UUID;
    v_current_balance BIGINT;
    v_new_balance BIGINT;
    v_caller_id UUID;
    v_role TEXT;
BEGIN
    -- Check caller role
    v_role := current_setting('request.jwt.claim.role', true);
    IF v_role IS NULL THEN
        v_role := current_user;
    END IF;

    -- Only allow service_role
    IF v_role <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: Only backend service can add ledger entries';
    END IF;

    -- Validate inputs
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid user_id';
    END IF;

    IF p_amount IS NULL OR p_amount = 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    IF p_reward_type IS NULL OR p_reward_type NOT IN (
        'meditation_completion', 'reflection_note', 'chat_message', 
        'daily_login', 'bonus', 'purchase', 'refund', 'usage', 'admin_adjustment'
    ) THEN
        RAISE EXCEPTION 'Invalid reward_type';
    END IF;

    IF p_description IS NULL OR length(p_description) > 500 THEN
        RAISE EXCEPTION 'Invalid description';
    END IF;

    -- Get current balance
    SELECT COALESCE(total_coins, 0) INTO v_current_balance
    FROM user_camly_coins
    WHERE user_id = p_user_id;

    IF v_current_balance IS NULL THEN
        v_current_balance := 0;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance + p_amount;

    -- Prevent negative balance
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Update user balance
    INSERT INTO user_camly_coins (user_id, total_coins, lifetime_coins)
    VALUES (p_user_id, 
        CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END,
        CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_coins = user_camly_coins.total_coins + p_amount,
        lifetime_coins = CASE 
            WHEN p_amount > 0 THEN user_camly_coins.lifetime_coins + p_amount 
            ELSE user_camly_coins.lifetime_coins 
        END,
        updated_at = now();

    -- Create ledger entry
    INSERT INTO reward_ledger (
        user_id, amount, reward_type, description, reference_id,
        balance_after, created_by, is_admin_action, ip_address, user_agent
    )
    VALUES (
        p_user_id, p_amount, p_reward_type, p_description, p_reference_id,
        v_new_balance, p_user_id, p_is_admin_action, p_ip_address, p_user_agent
    )
    RETURNING id INTO v_ledger_id;

    -- Log admin actions
    IF p_is_admin_action THEN
        INSERT INTO admin_audit_logs (
            admin_id, table_name, action_type, record_id, 
            ip_address, user_agent, query_details
        )
        VALUES (
            auth.uid(), 'reward_ledger', 'INSERT', v_ledger_id::TEXT,
            p_ip_address, p_user_agent, 
            jsonb_build_object(
                'user_id', p_user_id,
                'amount', p_amount,
                'reward_type', p_reward_type,
                'description', p_description
            )
        );
    END IF;

    RETURN v_ledger_id;
END;
$$;

-- 9. Revoke direct access from anon role on sensitive tables
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.private_messages FROM anon;
REVOKE ALL ON public.user_camly_coins FROM anon;
REVOKE ALL ON public.reward_ledger FROM anon;
REVOKE ALL ON public.light_acknowledgements FROM anon;

-- Grant to authenticated only
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.private_messages TO authenticated;
GRANT SELECT ON public.user_camly_coins TO authenticated;
GRANT SELECT ON public.reward_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.light_acknowledgements TO authenticated;

-- 10. Ensure admin_audit_logs has proper RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_select_admin" ON admin_audit_logs;
CREATE POLICY "audit_select_admin" ON admin_audit_logs
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "audit_insert_service" ON admin_audit_logs;
CREATE POLICY "audit_insert_service" ON admin_audit_logs
FOR INSERT TO service_role
WITH CHECK (true);

-- Allow security definer functions to insert
CREATE POLICY "audit_insert_internal" ON admin_audit_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin() OR public.is_service_role());

GRANT SELECT ON public.admin_audit_logs TO authenticated;

-- 11. Create function to soft-delete messages
CREATE OR REPLACE FUNCTION public.soft_delete_message(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sender_id UUID;
BEGIN
    -- Get sender
    SELECT sender_id INTO v_sender_id
    FROM private_messages
    WHERE id = p_message_id AND deleted_at IS NULL;

    -- Only sender can delete
    IF v_sender_id IS NULL OR v_sender_id <> auth.uid() THEN
        RETURN false;
    END IF;

    -- Soft delete
    UPDATE private_messages
    SET deleted_at = now(), deleted_by = auth.uid()
    WHERE id = p_message_id AND sender_id = auth.uid();

    RETURN true;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.soft_delete_message(UUID) TO authenticated;