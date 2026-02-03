-- Create buildings table
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- RLS policies for buildings (public read for code verification)
CREATE POLICY "Public read access for buildings" 
ON public.buildings 
FOR SELECT 
USING (true);

-- Add building_id to attendance_sessions
ALTER TABLE public.attendance_sessions 
ADD COLUMN building_id UUID REFERENCES public.buildings(id);

-- Add building_id to visitors
ALTER TABLE public.visitors 
ADD COLUMN building_id UUID REFERENCES public.buildings(id);

-- Add building_id to hosts (hosts belong to buildings)
ALTER TABLE public.hosts 
ADD COLUMN building_id UUID REFERENCES public.buildings(id);

-- Insert the four buildings with their access codes
INSERT INTO public.buildings (name, code, description) VALUES
('ANS', 'ANS26', 'ANS Building'),
('GATA', 'GATA26', 'GATA Building'),
('HQ', 'HQ26', 'Headquarters'),
('OLD HQ', 'OLDHQ26', 'Old Headquarters');

-- Create trigger for buildings updated_at
CREATE TRIGGER update_buildings_updated_at
BEFORE UPDATE ON public.buildings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();