-- Add angel cursor color preference to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS angel_cursor_color TEXT DEFAULT 'pink';

-- Add check constraint for valid colors
ALTER TABLE public.user_preferences 
ADD CONSTRAINT valid_angel_cursor_color 
CHECK (angel_cursor_color IN ('pink', 'gold', 'white', 'purple'));