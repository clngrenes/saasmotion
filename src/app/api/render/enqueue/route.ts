import { NextResponse } from "next/server";
import { dispatchRenderWorker } from "../../../../lib/render/dispatch-render-worker";
import { getServiceSupabase } from "../../../../lib/supabase/server";
import { screenshotVideoSchema } from "../../../../remotion/schemas/screenshot-video-schema";
import type { EnqueueRenderRequest, EnqueueRenderResponse } from "../../../../types/render-job";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnqueueRenderRequest;

    const parseResult = screenshotVideoSchema.safeParse(body.props);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      const detail = firstIssue
        ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
        : "Props failed validation";
      return NextResponse.json(
        { error: "Invalid props", message: detail, details: parseResult.error.format() },
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

    const workerUrl = process.env.RENDER_WORKER_URL;
    if (!workerUrl) {
      await supabase
        .from("render_jobs")
        .update({
          status: "failed",
          error_details: "RENDER_WORKER_URL fehlt auf Vercel",
        })
        .eq("id", job.id);
      return NextResponse.json(
        { error: "Render worker not configured" },
        { status: 503 },
      );
    }

    await supabase
      .from("render_jobs")
      .update({ status: "rendering" })
      .eq("id", job.id);

    try {
      await dispatchRenderWorker(job.id, props);
    } catch (workerError: unknown) {
      const message =
        workerError instanceof Error ? workerError.message : "Worker dispatch failed";
      await supabase
        .from("render_jobs")
        .update({ status: "failed", error_details: message })
        .eq("id", job.id);
      throw workerError;
    }

    const response: EnqueueRenderResponse = {
      jobId: job.id,
      status: "rendering",
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
