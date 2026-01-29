-- Create visitor categories enum
CREATE TYPE public.visitor_category AS ENUM ('guest', 'contractor', 'delivery', 'interview', 'vendor', 'other');

-- Create hosts table (employees who can be visited)
CREATE TABLE public.hosts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  position TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance sessions table (daily sessions)
CREATE TABLE public.attendance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  host_id UUID REFERENCES public.hosts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  category public.visitor_category NOT NULL DEFAULT 'guest',
  purpose TEXT,
  time_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_out TIMESTAMP WITH TIME ZONE,
  signature_verified BOOLEAN NOT NULL DEFAULT false,
  badge_number TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_visitors_session_id ON public.visitors(session_id);
CREATE INDEX idx_visitors_host_id ON public.visitors(host_id);
CREATE INDEX idx_visitors_name ON public.visitors(name);
CREATE INDEX idx_visitors_time_in ON public.visitors(time_in);
CREATE INDEX idx_attendance_sessions_date ON public.attendance_sessions(session_date);

-- Enable Row Level Security (public access since no auth)
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (no authentication required)
CREATE POLICY "Public read access for hosts" ON public.hosts FOR SELECT USING (true);
CREATE POLICY "Public insert access for hosts" ON public.hosts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for hosts" ON public.hosts FOR UPDATE USING (true);
CREATE POLICY "Public delete access for hosts" ON public.hosts FOR DELETE USING (true);

CREATE POLICY "Public read access for sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert access for sessions" ON public.attendance_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for sessions" ON public.attendance_sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete access for sessions" ON public.attendance_sessions FOR DELETE USING (true);

CREATE POLICY "Public read access for visitors" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Public insert access for visitors" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for visitors" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "Public delete access for visitors" ON public.visitors FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hosts_updated_at
  BEFORE UPDATE ON public.hosts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_sessions_updated_at
  BEFORE UPDATE ON public.attendance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();