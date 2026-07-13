import { getServiceSupabase } from "../supabase/server";
import type { RenderStatus } from "../../types/render-job";

export type RenderJobSnapshot = {
  status: RenderStatus;
  videoUrl?: string;
  errorDetails?: string;
};

export async function getRenderJobSnapshot(
  jobId: string,
): Promise<RenderJobSnapshot> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("render_jobs")
    .select("status, s3_video_url, error_details")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    throw new Error(`Render job not found: ${error?.message ?? jobId}`);
  }

  return {
    status: data.status as RenderStatus,
    videoUrl: data.s3_video_url ?? undefined,
    errorDetails: data.error_details ?? undefined,
  };
}
