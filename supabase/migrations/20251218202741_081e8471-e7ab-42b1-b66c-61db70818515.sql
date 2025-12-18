-- Create greeting history table
CREATE TABLE public.greeting_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  greeting_title TEXT NOT NULL,
  greeting_message TEXT NOT NULL,
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.greeting_history ENABLE ROW LEVEL SECURITY;

-- Create policy for user-only access (private)
CREATE POLICY "Users can view own greeting history"
ON public.greeting_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own greeting history"
ON public.greeting_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_greeting_history_user_date ON public.greeting_history (user_id, shown_date DESC);