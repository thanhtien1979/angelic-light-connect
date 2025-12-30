-- Create user_light_profile table to store Light scores and energy direction
CREATE TABLE public.user_light_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  light_score INTEGER NOT NULL DEFAULT 50 CHECK (light_score >= 0 AND light_score <= 100),
  energy_direction TEXT NOT NULL DEFAULT 'stable' CHECK (energy_direction IN ('ascending', 'stable', 'descending')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_answers JSONB DEFAULT NULL,
  last_light_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
  warning_level INTEGER NOT NULL DEFAULT 0 CHECK (warning_level >= 0 AND warning_level <= 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create light_behaviors table to track behavioral patterns
CREATE TABLE public.light_behaviors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('message', 'reaction', 'comment', 'testimonial', 'moment')),
  sentiment_score NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  energy_type TEXT NOT NULL DEFAULT 'neutral' CHECK (energy_type IN ('positive', 'neutral', 'negative')),
  context JSONB DEFAULT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create light_interventions table to track interventions
CREATE TABLE public.light_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('elevate', 'remind', 'filter')),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 3),
  reason TEXT NOT NULL,
  angel_message TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_light_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.light_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.light_interventions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_light_profile
CREATE POLICY "Users can view own light profile"
  ON public.user_light_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own light profile"
  ON public.user_light_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all light profiles"
  ON public.user_light_profile FOR ALL
  USING (is_service_role());

-- RLS policies for light_behaviors (only service role can manage)
CREATE POLICY "Service role can manage light behaviors"
  ON public.light_behaviors FOR ALL
  USING (is_service_role());

CREATE POLICY "Users can view own behaviors"
  ON public.light_behaviors FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policies for light_interventions
CREATE POLICY "Users can view own interventions"
  ON public.light_interventions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge own interventions"
  ON public.light_interventions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all interventions"
  ON public.light_interventions FOR ALL
  USING (is_service_role());

-- Admins can view all light profiles
CREATE POLICY "Admins can view all light profiles"
  ON public.user_light_profile FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all behaviors"
  ON public.light_behaviors FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all interventions"
  ON public.light_interventions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_light_behaviors_user_id ON public.light_behaviors(user_id);
CREATE INDEX idx_light_behaviors_analyzed_at ON public.light_behaviors(analyzed_at);
CREATE INDEX idx_light_interventions_user_id ON public.light_interventions(user_id);
CREATE INDEX idx_user_light_profile_light_score ON public.user_light_profile(light_score);

-- Trigger to update updated_at
CREATE TRIGGER update_user_light_profile_updated_at
  BEFORE UPDATE ON public.user_light_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();