-- Create table to track daily greetings per user
CREATE TABLE public.user_daily_greetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  last_greeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  greeting_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_daily_greetings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own greeting data"
ON public.user_daily_greetings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own greeting data"
ON public.user_daily_greetings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own greeting data"
ON public.user_daily_greetings
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_daily_greetings_updated_at
BEFORE UPDATE ON public.user_daily_greetings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();