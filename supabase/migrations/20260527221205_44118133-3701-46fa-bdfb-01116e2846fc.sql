
-- 1. Remove admin access to private message content
DROP POLICY IF EXISTS messages_select_admin ON public.private_messages;

-- 2. Remove admin full-table select on profiles (protects encryption_salt)
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;

-- 3. Enforce public_consent before allowing visibility='public' on chat_messages
CREATE OR REPLACE FUNCTION public.enforce_chat_message_public_consent()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.visibility = 'public' AND COALESCE(NEW.public_consent, false) = false THEN
    RAISE EXCEPTION 'Public visibility requires explicit public_consent = true';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_chat_message_public_consent_trg ON public.chat_messages;
CREATE TRIGGER enforce_chat_message_public_consent_trg
BEFORE INSERT OR UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.enforce_chat_message_public_consent();
