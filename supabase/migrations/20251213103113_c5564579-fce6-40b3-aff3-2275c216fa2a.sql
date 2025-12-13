-- Fix function search path for get_validated_session_id
CREATE OR REPLACE FUNCTION public.get_validated_session_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT NULLIF(current_setting('app.validated_session_id', true), '');
$$;