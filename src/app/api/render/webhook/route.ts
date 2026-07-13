import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase/server";
import type { RemotionWebhookPayload } from "../../../../types/render-job";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RemotionWebhookPayload;
    
    // Security: You should verify a webhook secret from Remotion Lambda here
    
    console.log(`[Webhook] Received webhook for renderId ${payload.renderId}:`, payload.type);

    const supabase = getServiceSupabase();

    // 1. Find job in Supabase by remotionRenderId
    const { data: job, error: fetchError } = await supabase
      .from("render_jobs")
      .select("id")
      .eq("remotion_render_id", payload.renderId)
      .single();

    if (fetchError || !job) {
      throw new Error(`Job for renderId ${payload.renderId} not found in Supabase: ${fetchError?.message}`);
    }

    if (payload.type === "success") {
      // 2. Update Supabase with success and S3 URL
      const s3Url = `https://${payload.expectedBucketName}.s3.amazonaws.com/${payload.expectedKey}`;
      
      await supabase
        .from("render_jobs")
        .update({
          status: "done",
          s3_video_url: s3Url,
        })
        .eq("id", job.id);
      
      console.log(`[Supabase] Updated job ${job.id} to 'done', URL: ${s3Url}`);
      
    } else if (payload.type === "timeout" || payload.type === "error") {
      // 3. Update Supabase with error
      const errorMsg = payload.errors?.[0]?.message || "Unknown error";
      
      await supabase
        .from("render_jobs")
        .update({
          status: "failed",
          error_details: errorMsg,
        })
        .eq("id", job.id);
      
      console.log(`[Supabase] Updated job ${job.id} to 'failed': ${errorMsg}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
