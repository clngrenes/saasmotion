import { getServiceSupabase } from "../supabase/server";

const VIDEOS_BUCKET = "videos";

export async function uploadVideoToSupabase(
  jobId: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const supabase = getServiceSupabase();
  const extension = contentType.includes("webm") ? "webm" : "mp4";
  const objectPath = `renders/${jobId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(VIDEOS_BUCKET)
    .upload(objectPath, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase video upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(VIDEOS_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}
