-- Create breathing session history table
CREATE TABLE public.breathing_session_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  ambient_sound TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.breathing_session_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own breathing history" 
ON public.breathing_session_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breathing history" 
ON public.breathing_session_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own breathing history" 
ON public.breathing_session_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_breathing_session_history_user_date 
ON public.breathing_session_history (user_id, completed_at DESC);