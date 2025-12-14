-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add conversation_summaries table to store generated summaries
CREATE TABLE public.conversation_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  summary TEXT NOT NULL,
  key_themes TEXT[] DEFAULT '{}',
  emotional_tone TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own summaries" 
ON public.conversation_summaries 
FOR SELECT 
USING (
  CASE
    WHEN (auth.uid() IS NOT NULL) THEN (user_id = auth.uid())
    ELSE (user_id IS NULL)
  END
);

CREATE POLICY "Users can create their own summaries" 
ON public.conversation_summaries 
FOR INSERT 
WITH CHECK (
  CASE
    WHEN (auth.uid() IS NOT NULL) THEN (user_id = auth.uid())
    ELSE (user_id IS NULL)
  END
);

CREATE POLICY "Users can update their own summaries" 
ON public.conversation_summaries 
FOR UPDATE 
USING (
  CASE
    WHEN (auth.uid() IS NOT NULL) THEN (user_id = auth.uid())
    ELSE (user_id IS NULL)
  END
);

CREATE POLICY "Users can delete their own summaries" 
ON public.conversation_summaries 
FOR DELETE 
USING (
  CASE
    WHEN (auth.uid() IS NOT NULL) THEN (user_id = auth.uid())
    ELSE (user_id IS NULL)
  END
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversation_summaries_updated_at
BEFORE UPDATE ON public.conversation_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();