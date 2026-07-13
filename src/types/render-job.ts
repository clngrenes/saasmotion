import type { ScreenshotVideoProps } from "../remotion/types/screenshot-video";

/**
 * Mögliche Statuswerte für einen Render-Job im System.
 * - queued: In die SQS-Queue eingereiht, wartet auf Worker.
 * - rendering: SQS-Worker hat den Job an Remotion Lambda übergeben.
 * - done: Remotion Lambda hat das Video erfolgreich auf S3 abgelegt.
 * - failed: Fehler aufgetreten (Details in errorDetails).
 */
export type RenderStatus = "queued" | "rendering" | "done" | "failed";

/**
 * Datenbank-Modell für die Supabase-Tabelle "render_jobs".
 */
export interface RenderJob {
  readonly id: string;
  readonly userId: string;
  readonly status: RenderStatus;
  readonly props: ScreenshotVideoProps;
  readonly remotionRenderId?: string;
  readonly s3VideoUrl?: string;
  readonly errorDetails?: string;
  readonly createdAt: string;
}

/**
 * Request-Body für POST /api/render/enqueue
 * Wird vom Frontend gesendet, wenn der User "Video rendern" klickt.
 */
export interface EnqueueRenderRequest {
  readonly props: ScreenshotVideoProps;
}

/**
 * Response von POST /api/render/enqueue
 */
export interface EnqueueRenderResponse {
  readonly jobId: string;
  readonly status: RenderStatus;
}

/**
 * Struktur der SQS-Message, die unsere API an die Queue sendet.
 * Die AWS Lambda (Worker) empfängt genau dieses Format.
 */
export interface SqsRenderMessage {
  readonly jobId: string;
  readonly props: ScreenshotVideoProps;
}

/**
 * Webhook-Payload von Remotion Lambda.
 * (Stark vereinfacht; Remotion Lambda sendet mehr Details,
 * aber das sind die für uns relevanten Felder).
 */
export interface RemotionWebhookPayload {
  readonly type: "success" | "timeout" | "error";
  readonly renderId: string;
  readonly expectedBucketName: string;
  readonly expectedKey: string;
  readonly errors: { message: string }[];
}
