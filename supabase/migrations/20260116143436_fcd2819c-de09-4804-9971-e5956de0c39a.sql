-- Add per-user encryption salt to profiles table for secure client-side encryption
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS encryption_salt text;

-- Create a function to generate a random salt for new users using gen_random_uuid
CREATE OR REPLACE FUNCTION public.generate_encryption_salt()
RETURNS text AS $$
BEGIN
  -- Generate salt using multiple UUIDs concatenated for sufficient entropy
  RETURN concat(
    replace(gen_random_uuid()::text, '-', ''),
    replace(gen_random_uuid()::text, '-', '')
  );
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a trigger to auto-generate salt for new profiles
CREATE OR REPLACE FUNCTION public.set_encryption_salt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.encryption_salt IS NULL THEN
    NEW.encryption_salt := public.generate_encryption_salt();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_encryption_salt_trigger ON public.profiles;
CREATE TRIGGER set_encryption_salt_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_encryption_salt();

-- Update existing profiles to have a salt (for users that already exist)
UPDATE public.profiles 
SET encryption_salt = public.generate_encryption_salt()
WHERE encryption_salt IS NULL;