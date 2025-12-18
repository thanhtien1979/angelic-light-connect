-- Create meditation history table for private session logging
CREATE TABLE public.meditation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_seconds INTEGER NOT NULL,
  theme TEXT,
  ambient_sound TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meditation_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own meditation history
CREATE POLICY "Users can view own meditation history" 
ON public.meditation_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own meditation history
CREATE POLICY "Users can insert own meditation history" 
ON public.meditation_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own meditation history
CREATE POLICY "Users can delete own meditation history" 
ON public.meditation_history 
FOR DELETE 
USING (auth.uid() = user_id);