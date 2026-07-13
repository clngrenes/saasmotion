import { NextResponse } from "next/server";
import { inngest } from "../../../../lib/inngest/client";
import { getServiceSupabase } from "../../../../lib/supabase/server";
import { screenshotVideoSchema } from "../../../../remotion/schemas/screenshot-video-schema";
import type { EnqueueRenderRequest, EnqueueRenderResponse } from "../../../../types/render-job";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnqueueRenderRequest;

    const parseResult = screenshotVideoSchema.safeParse(body.props);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid props", details: parseResult.error.format() },
        { status: 400 },
      );
    }
    const props = parseResult.data;

    const mockUserId = "00000000-0000-0000-0000-000000000000";
    const supabase = getServiceSupabase();

    const { data: job, error: insertError } = await supabase
      .from("render_jobs")
      .insert({
        user_id: mockUserId,
        status: "queued",
        props,
      })
      .select()
      .single();

    if (insertError || !job) {
      throw new Error(`Supabase insert failed: ${insertError?.message}`);
    }

    console.log(`[Enqueue] Created render job ${job.id}`);

    try {
      await inngest.send({
        name: "saasmotion/render.requested",
        data: {
          jobId: job.id,
          props,
        },
      });
      console.log(`[Inngest] Enqueued render for job ${job.id}`);
    } catch (inngestError) {
      console.error("[Inngest] Failed to enqueue:", inngestError);
      await supabase
        .from("render_jobs")
        .update({
          status: "failed",
          error_details: "Failed to enqueue render job",
        })
        .eq("id", job.id);
      throw inngestError;
    }

    const response: EnqueueRenderResponse = {
      jobId: job.id,
      status: "queued",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Enqueue] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message },
      { status: 500 },
    );
  }
}
