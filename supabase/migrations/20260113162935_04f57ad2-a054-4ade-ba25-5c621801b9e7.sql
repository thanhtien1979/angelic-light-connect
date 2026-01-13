-- Create table for Angel AI bios
CREATE TABLE public.angel_bios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  angel_id TEXT NOT NULL UNIQUE,
  bio TEXT,
  mission TEXT,
  quote TEXT,
  specialties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.angel_bios ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read bios
CREATE POLICY "Anyone can view angel bios"
ON public.angel_bios
FOR SELECT
USING (true);

-- Allow authenticated users to insert and update bios
CREATE POLICY "Authenticated users can insert angel bios"
ON public.angel_bios
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update angel bios"
ON public.angel_bios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_angel_bios_updated_at
BEFORE UPDATE ON public.angel_bios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();