-- User Memory table for Personalized AI
CREATE TABLE public.user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL, -- 'preference', 'milestone', 'interest', 'struggle', 'goal'
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  context TEXT, -- Additional context about the memory
  importance_score INTEGER DEFAULT 5, -- 1-10, higher = more important to remember
  last_referenced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mood Entries table for Mood Tracker
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5), -- 1=very sad, 5=very happy
  mood_label TEXT NOT NULL, -- 'very_sad', 'sad', 'neutral', 'happy', 'very_happy'
  emotions TEXT[] DEFAULT '{}', -- array of specific emotions: 'anxious', 'grateful', 'tired', etc
  note TEXT, -- Optional note about feelings
  activities TEXT[] DEFAULT '{}', -- What activities contributed: 'meditation', 'exercise', 'work', etc
  ai_insight TEXT, -- AI-generated insight for this entry
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mood Insights table for AI-generated weekly/monthly insights
CREATE TABLE public.mood_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  insight_text TEXT NOT NULL,
  patterns_detected JSONB, -- Patterns the AI found
  recommendations TEXT[], -- AI recommendations
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_memory
CREATE POLICY "Users can view their own memories" 
ON public.user_memory FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories" 
ON public.user_memory FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
ON public.user_memory FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
ON public.user_memory FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries" 
ON public.mood_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries" 
ON public.mood_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries" 
ON public.mood_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries" 
ON public.mood_entries FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for mood_insights
CREATE POLICY "Users can view their own mood insights" 
ON public.mood_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood insights" 
ON public.mood_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_memory_user_id ON public.user_memory(user_id);
CREATE INDEX idx_user_memory_type ON public.user_memory(memory_type);
CREATE INDEX idx_mood_entries_user_id ON public.mood_entries(user_id);
CREATE INDEX idx_mood_entries_date ON public.mood_entries(entry_date);
CREATE INDEX idx_mood_insights_user_id ON public.mood_insights(user_id);

-- Trigger to update updated_at for user_memory
CREATE TRIGGER update_user_memory_updated_at
BEFORE UPDATE ON public.user_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Unique constraint to prevent duplicate mood entries per day
CREATE UNIQUE INDEX idx_mood_entries_user_date ON public.mood_entries(user_id, entry_date);