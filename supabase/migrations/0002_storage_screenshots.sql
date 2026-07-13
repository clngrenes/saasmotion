-- Supabase Storage bucket for user-uploaded screenshots (public read for Remotion texture loading)

INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY "Public read screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'screenshots');

-- Service role bypasses RLS; uploads go through Next.js API with service key.
