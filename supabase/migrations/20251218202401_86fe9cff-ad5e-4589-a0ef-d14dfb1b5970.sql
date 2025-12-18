-- Add greeting_enabled column to track user preference
ALTER TABLE public.user_daily_greetings 
ADD COLUMN greeting_enabled BOOLEAN NOT NULL DEFAULT true;