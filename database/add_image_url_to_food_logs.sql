-- Add image_url column to food_logs table
ALTER TABLE public.food_logs 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for uploads bucket
-- Public view
CREATE POLICY "Uploads Public View" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'uploads');

-- Authenticated insert
CREATE POLICY "Uploads Auth Insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Owner update
CREATE POLICY "Uploads Owner Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'uploads' AND auth.uid() = owner);

-- Owner delete
CREATE POLICY "Uploads Owner Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'uploads' AND auth.uid() = owner);
