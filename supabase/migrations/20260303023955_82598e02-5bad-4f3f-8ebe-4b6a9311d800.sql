
-- Add 'web3_claim' to the allowed reward_types in add_reward_ledger_entry function
CREATE OR REPLACE FUNCTION public.add_reward_ledger_entry(p_user_id uuid, p_amount integer, p_reward_type text, p_description text, p_reference_id text DEFAULT NULL::text, p_is_admin_action boolean DEFAULT false, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ledger_id UUID;
    v_current_balance BIGINT;
    v_new_balance BIGINT;
    v_caller_id UUID;
    v_role TEXT;
BEGIN
    v_role := current_setting('request.jwt.claim.role', true);
    IF v_role IS NULL THEN
        v_role := current_user;
    END IF;

    IF v_role <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: Only backend service can add ledger entries';
    END IF;

    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid user_id';
    END IF;

    IF p_amount IS NULL OR p_amount = 0 THEN
        RAISE EXCEPTION 'Invalid amount';
    END IF;

    IF p_reward_type IS NULL OR p_reward_type NOT IN (
        'meditation_completion', 'reflection_note', 'chat_message', 
        'daily_login', 'bonus', 'purchase', 'refund', 'usage', 'admin_adjustment', 'web3_claim'
    ) THEN
        RAISE EXCEPTION 'Invalid reward_type';
    END IF;

    IF p_description IS NULL OR length(p_description) > 500 THEN
        RAISE EXCEPTION 'Invalid description';
    END IF;

    SELECT COALESCE(total_coins, 0) INTO v_current_balance
    FROM user_camly_coins
    WHERE user_id = p_user_id;

    IF v_current_balance IS NULL THEN
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + p_amount;

    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

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

    INSERT INTO reward_ledger (
        user_id, amount, reward_type, description, reference_id,
        balance_after, created_by, is_admin_action, ip_address, user_agent
    )
    VALUES (
        p_user_id, p_amount, p_reward_type, p_description, p_reference_id,
        v_new_balance, p_user_id, p_is_admin_action, p_ip_address, p_user_agent
    )
    RETURNING id INTO v_ledger_id;

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
$function$;
