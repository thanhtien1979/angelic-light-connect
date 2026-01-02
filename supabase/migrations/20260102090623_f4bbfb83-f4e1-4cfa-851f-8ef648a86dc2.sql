-- Add angel_cursor_enabled column
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS angel_cursor_enabled BOOLEAN DEFAULT true;

-- Add angel_cursor_size column
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS angel_cursor_size TEXT DEFAULT 'medium';

-- Add check constraint for valid sizes
ALTER TABLE public.user_preferences 
ADD CONSTRAINT valid_angel_cursor_size 
CHECK (angel_cursor_size IN ('small', 'medium', 'large'));