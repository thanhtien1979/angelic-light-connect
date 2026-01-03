-- Drop the check constraint that's blocking JSON storage
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS valid_angel_cursor_color;

-- Add a new column for storing full angel presence settings as JSONB
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS angel_presence_settings JSONB DEFAULT NULL;