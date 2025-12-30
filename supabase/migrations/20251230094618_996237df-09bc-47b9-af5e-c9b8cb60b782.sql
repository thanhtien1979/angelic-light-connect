-- Add Light Law agreement columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS agreed_to_light_law boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS light_law_agreed_at timestamp with time zone;

-- Create index for querying users who agreed
CREATE INDEX IF NOT EXISTS idx_profiles_agreed_to_light_law ON public.profiles(agreed_to_light_law) WHERE agreed_to_light_law = true;