import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase/server";
import { screenshotVideoSchema } from "../../../../remotion/schemas/screenshot-video-schema";
import type { EnqueueRenderRequest, EnqueueRenderResponse, RenderJob, SqsRenderMessage } from "../../../../types/render-job";

// Region and SQS Queue URL from env (mocked defaults for dev)
const SQS_REGION = process.env.AWS_REGION || "eu-central-1";
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || "https://sqs.eu-central-1.amazonaws.com/123456789012/render-jobs-queue";

const sqsClient = new SQSClient({ region: SQS_REGION });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnqueueRenderRequest;
    
    // 1. Validate props using Zod Schema
    const parseResult = screenshotVideoSchema.safeParse(body.props);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid props", details: parseResult.error.format() },
        { status: 400 }
      );
    }
    const props = parseResult.data;

    // 2. Auth: Für V1 nutzen wir einen Mock-User. Später kommt hier die Session-Logik hin.
    const mockUserId = "00000000-0000-0000-0000-000000000000";

    // 3. Supabase Client via Service-Role (Bypass RLS für Backend-Insert)
    const supabase = getServiceSupabase();

    // 4. Save to Supabase (Echt)
    const { data: job, error: insertError } = await supabase
      .from("render_jobs")
      .insert({
        user_id: mockUserId,
        status: "queued",
        props: props,
      })
      .select()
      .single();

    if (insertError || !job) {
      throw new Error(`Supabase Insert Failed: ${insertError?.message}`);
    }

    console.log(`[Supabase] Created render job ${job.id} with status 'queued'`);

    // 5. Enqueue to SQS
    const sqsMessage: SqsRenderMessage = {
      jobId: job.id,
      props,
    };

    const command = new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify(sqsMessage),
    });

    try {
      await sqsClient.send(command);
      console.log(`[SQS] Enqueued job ${job.id}`);
    } catch (sqsError) {
      // Wenn SQS fehlschlägt, setzen wir den Job auf failed
      console.error("[SQS] Failed to enqueue:", sqsError);
      await supabase.from("render_jobs").update({ status: "failed", error_details: "Failed to enqueue to SQS" }).eq("id", job.id);
      throw sqsError;
    }

    // 6. Return success
    const response: EnqueueRenderResponse = {
      jobId: job.id,
      status: "queued",
    };
    
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error("[Enqueue] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

