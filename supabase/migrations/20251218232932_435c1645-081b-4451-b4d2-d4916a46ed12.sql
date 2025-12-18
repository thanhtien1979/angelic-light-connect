-- Create table for meditation reminder preferences
CREATE TABLE public.meditation_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reminders_enabled BOOLEAN NOT NULL DEFAULT false,
  preferred_times TEXT[] NOT NULL DEFAULT '{}',
  last_reminder_shown DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meditation_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own reminder settings" 
ON public.meditation_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminder settings" 
ON public.meditation_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminder settings" 
ON public.meditation_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_meditation_reminders_updated_at
BEFORE UPDATE ON public.meditation_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();