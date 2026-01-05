
-- Create testimonial_tags table
CREATE TABLE public.testimonial_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on testimonial_tags
ALTER TABLE public.testimonial_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can read tags
CREATE POLICY "Anyone can view testimonial tags" 
ON public.testimonial_tags 
FOR SELECT 
USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can manage testimonial tags" 
ON public.testimonial_tags 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert predefined spiritual tags
INSERT INTO public.testimonial_tags (name, icon, color, sort_order) VALUES
  ('Chữa lành tâm hồn', '💚', 'emerald', 1),
  ('Thiền định', '🧘', 'purple', 2),
  ('Giác ngộ', '✨', 'amber', 3),
  ('Kết nối tâm linh', '🙏', 'rose', 4),
  ('Bình an nội tâm', '🕊️', 'sky', 5),
  ('Tình yêu vô điều kiện', '💗', 'pink', 6),
  ('Tri ân vũ trụ', '🌟', 'gold', 7),
  ('Hành trình 5D', '🌈', 'violet', 8)
ON CONFLICT (name) DO NOTHING;
