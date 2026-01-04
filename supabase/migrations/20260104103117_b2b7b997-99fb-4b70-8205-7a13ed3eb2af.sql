-- Add bio column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Add constraint for max length
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 200);