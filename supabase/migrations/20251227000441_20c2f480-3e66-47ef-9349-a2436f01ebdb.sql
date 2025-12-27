-- Update award_camly_coins function to include public_consent_confirmed
CREATE OR REPLACE FUNCTION public.award_camly_coins(
  p_user_id uuid, 
  p_coins integer, 
  p_type text, 
  p_message text, 
  p_source_id text DEFAULT NULL::text, 
  p_is_public boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_acknowledgement_id uuid;
  v_role text;
BEGIN
  v_role := current_setting('request.jwt.claim.role', true);
  IF v_role IS NULL THEN
    v_role := current_user;
  END IF;

  -- Allow calls from trusted backend role.
  IF v_role <> 'service_role' THEN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required';
    END IF;

    IF auth.uid() <> p_user_id THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid user';
  END IF;

  IF p_coins IS NULL OR p_coins <= 0 OR p_coins > 10000 THEN
    RAISE EXCEPTION 'Invalid coin amount';
  END IF;

  IF p_type IS NULL OR p_type NOT IN ('meditation_completion','reflection_note','chat_message','daily_login') THEN
    RAISE EXCEPTION 'Invalid acknowledgement type';
  END IF;

  IF p_message IS NULL OR length(p_message) > 500 THEN
    RAISE EXCEPTION 'Invalid message';
  END IF;

  INSERT INTO public.user_camly_coins (user_id, total_coins, lifetime_coins)
  VALUES (p_user_id, p_coins, p_coins)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_coins = user_camly_coins.total_coins + p_coins,
    lifetime_coins = user_camly_coins.lifetime_coins + p_coins,
    updated_at = now();

  INSERT INTO public.light_acknowledgements (
    user_id,
    acknowledgement_type,
    camly_coins,
    spiritual_message,
    source_id,
    is_public,
    public_consent_confirmed
  )
  VALUES (
    p_user_id,
    p_type,
    p_coins,
    p_message,
    p_source_id,
    p_is_public,
    p_is_public  -- Only true if both is_public AND consent were confirmed
  )
  RETURNING id INTO v_acknowledgement_id;

  RETURN v_acknowledgement_id;
END;
$function$;