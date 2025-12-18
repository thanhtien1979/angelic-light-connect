-- Add digest notification preference to user_daily_greetings
ALTER TABLE public.user_daily_greetings 
ADD COLUMN digest_notifications_enabled BOOLEAN NOT NULL DEFAULT true;