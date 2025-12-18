-- Create custom breathing patterns table for users
CREATE TABLE public.custom_breathing_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  inhale_duration INTEGER NOT NULL DEFAULT 4,
  hold_after_inhale INTEGER DEFAULT 0,
  exhale_duration INTEGER NOT NULL DEFAULT 4,
  hold_after_exhale INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_breathing_patterns ENABLE ROW LEVEL SECURITY;

-- RLS policies - patterns are private to each user
CREATE POLICY "Users can view own breathing patterns"
ON public.custom_breathing_patterns
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own breathing patterns"
ON public.custom_breathing_patterns
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own breathing patterns"
ON public.custom_breathing_patterns
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own breathing patterns"
ON public.custom_breathing_patterns
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_custom_breathing_patterns_updated_at
BEFORE UPDATE ON public.custom_breathing_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();