import type { ScreenshotVideoProps } from "../remotion/types/screenshot-video";

/**
 * Mögliche Statuswerte für einen Render-Job im System.
 * - queued: Job wartet in der Worker-Queue.
 * - rendering: Worker rendert das Video.
 * - done: Video liegt in Supabase Storage.
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
 * Inngest-Event, das die Render-Pipeline startet.
 */
export interface RenderRequestedEventData {
  readonly jobId: string;
  readonly props: ScreenshotVideoProps;
}
