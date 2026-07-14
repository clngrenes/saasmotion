import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase/server";
import type { RenderStatus } from "../../../../types/render-job";

export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("render_jobs")
    .select("status, s3_video_url, error_details")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: data.status as RenderStatus,
    videoUrl: data.s3_video_url ?? undefined,
    errorDetails: data.error_details ?? undefined,
  });
}
