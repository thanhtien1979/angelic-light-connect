-- Harden SECURITY DEFINER functions with proper validation and access control
-- Focus on record_credit_usage and add_credits which handle financial operations

-- Harden record_credit_usage: Add role check to restrict to service_role only
CREATE OR REPLACE FUNCTION public.record_credit_usage(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Sử dụng credits'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction_id UUID;
  v_current_balance BIGINT;
  v_role text;
BEGIN
  -- Check caller role - only allow service_role
  v_role := current_setting('request.jwt.claim.role', true);
  IF v_role IS NULL THEN
    v_role := current_user;
  END IF;

  IF v_role <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Only backend service can record credit usage';
  END IF;

  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 100000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  -- Get current balance
  SELECT total_coins INTO v_current_balance
  FROM public.user_camly_coins
  WHERE user_id = p_user_id;
  
  -- Check if enough balance
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct from balance
  UPDATE public.user_camly_coins
  SET total_coins = total_coins - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, transaction_type, amount, description, status)
  VALUES (p_user_id, 'usage', -p_amount, p_description, 'completed')
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$function$;

-- Restrict function access to service_role only
REVOKE ALL ON FUNCTION public.record_credit_usage(uuid, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_credit_usage(uuid, integer, text) FROM anon;
REVOKE ALL ON FUNCTION public.record_credit_usage(uuid, integer, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_credit_usage(uuid, integer, text) TO service_role;

-- Harden add_credits: Add role check to restrict to service_role only
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text,
  p_payment_method text DEFAULT NULL::text,
  p_payment_reference text DEFAULT NULL::text,
  p_package_id text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_transaction_id UUID;
  v_role text;
BEGIN
  -- Check caller role - only allow service_role
  v_role := current_setting('request.jwt.claim.role', true);
  IF v_role IS NULL THEN
    v_role := current_user;
  END IF;

  IF v_role <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Only backend service can add credits';
  END IF;

  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 10000000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  IF p_transaction_type IS NULL OR p_transaction_type NOT IN ('purchase', 'bonus', 'refund', 'reward', 'daily_login') THEN
    RAISE EXCEPTION 'Invalid transaction type';
  END IF;

  -- Add to balance (upsert)
  INSERT INTO public.user_camly_coins (user_id, total_coins, lifetime_coins)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_coins = user_camly_coins.total_coins + p_amount,
    lifetime_coins = user_camly_coins.lifetime_coins + p_amount,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, transaction_type, amount, description, 
    payment_method, payment_reference, package_id, status
  )
  VALUES (
    p_user_id, p_transaction_type, p_amount, p_description,
    p_payment_method, p_payment_reference, p_package_id, 'completed'
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$function$;

-- Restrict function access to service_role only
REVOKE ALL ON FUNCTION public.add_credits(uuid, integer, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.add_credits(uuid, integer, text, text, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.add_credits(uuid, integer, text, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(uuid, integer, text, text, text, text, text) TO service_role;