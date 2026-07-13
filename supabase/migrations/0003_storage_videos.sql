-- Supabase Storage bucket for rendered videos (public read for download links)

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Public read videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Uploads go through the service role in the Inngest render pipeline.
