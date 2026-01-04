-- Create buckets if they don't exist
-- Note: 'storage' schema is managed by Supabase, typically buckets are created via API or Dashboard
-- but we can use SQL for local development and direct setup.

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for the images bucket
-- Allow public read access
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- Allow authenticated users to upload/update/delete their own files in the bucket
-- Note: In the generate-export function, we use service_role, so RLS doesn't apply there.
-- But for the app's scanner, we need these.
CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can update own images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner);

CREATE POLICY "Users can delete own images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (auth.uid() = owner);
