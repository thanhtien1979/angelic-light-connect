-- Create saved greetings table
CREATE TABLE public.saved_greetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  greeting_history_id UUID NOT NULL REFERENCES public.greeting_history(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, greeting_history_id)
);

-- Enable RLS
ALTER TABLE public.saved_greetings ENABLE ROW LEVEL SECURITY;

-- Create policies for private access
CREATE POLICY "Users can view own saved greetings"
ON public.saved_greetings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save greetings"
ON public.saved_greetings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave greetings"
ON public.saved_greetings
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_saved_greetings_user ON public.saved_greetings (user_id, created_at DESC);