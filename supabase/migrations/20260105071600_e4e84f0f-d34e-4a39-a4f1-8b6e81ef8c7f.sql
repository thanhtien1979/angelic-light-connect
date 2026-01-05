-- Create testimonial_reactions table for diverse reactions
CREATE TABLE public.testimonial_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  testimonial_id UUID NOT NULL REFERENCES public.testimonials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(testimonial_id, user_id, reaction_type)
);

-- Create index for faster lookups
CREATE INDEX idx_testimonial_reactions_testimonial ON public.testimonial_reactions(testimonial_id);
CREATE INDEX idx_testimonial_reactions_user ON public.testimonial_reactions(user_id);

-- Enable RLS
ALTER TABLE public.testimonial_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for testimonial_reactions
CREATE POLICY "Anyone can view reactions" 
ON public.testimonial_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can add their own reactions" 
ON public.testimonial_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" 
ON public.testimonial_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add parent_id column to testimonial_comments for reply functionality
ALTER TABLE public.testimonial_comments 
ADD COLUMN parent_id UUID REFERENCES public.testimonial_comments(id) ON DELETE CASCADE;

-- Create index for faster parent lookups
CREATE INDEX idx_testimonial_comments_parent ON public.testimonial_comments(parent_id);

-- Create function to count reactions by type
CREATE OR REPLACE FUNCTION public.get_testimonial_reaction_counts(p_testimonial_id UUID)
RETURNS TABLE(reaction_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT tr.reaction_type, COUNT(*)::BIGINT
  FROM public.testimonial_reactions tr
  WHERE tr.testimonial_id = p_testimonial_id
  GROUP BY tr.reaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;