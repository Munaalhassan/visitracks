
-- Add photo_url and host_name columns to visitors
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS host_name text;

-- Create storage bucket for visitor photos
INSERT INTO storage.buckets (id, name, public) VALUES ('visitor-photos', 'visitor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to visitor photos
CREATE POLICY "Public read access for visitor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'visitor-photos');

-- Allow public insert for visitor photos
CREATE POLICY "Public insert access for visitor photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'visitor-photos');

-- Allow public update for visitor photos  
CREATE POLICY "Public update access for visitor photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'visitor-photos');
