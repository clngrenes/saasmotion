-- supabase/migrations/0001_create_render_jobs.sql

-- Status als ENUM passend zu unseren TypeScript-Typen
CREATE TYPE render_status AS ENUM ('queued', 'rendering', 'done', 'failed');

CREATE TABLE render_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Im echten Projekt: REFERENCES auth.users(id) ON DELETE CASCADE
  user_id UUID NOT NULL, 
  status render_status NOT NULL DEFAULT 'queued',
  props JSONB NOT NULL,
  remotion_render_id TEXT,
  s3_video_url TEXT,
  error_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_render_jobs_updated_at
BEFORE UPDATE ON render_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Realtime: UI erhält Status-Updates ohne Polling
ALTER PUBLICATION supabase_realtime ADD TABLE render_jobs;
