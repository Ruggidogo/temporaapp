-- Create storage bucket for user logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true);

-- Policy: Users can view all logos (public bucket)
CREATE POLICY "Logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');

-- Policy: Users can upload their own logo
CREATE POLICY "Users can upload their own logo"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can update their own logo
CREATE POLICY "Users can update their own logo"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own logo
CREATE POLICY "Users can delete their own logo"
ON storage.objects
FOR DELETE
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add logo_url column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;