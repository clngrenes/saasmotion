import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import { renderVideoLocally } from "./render-video-local";
import { uploadVideoToSupabase } from "./upload-video-to-supabase";

/**
 * Rendert ein Video lokal (nur Dev ohne RENDER_WORKER_URL).
 * Produktion: Inngest → dispatchRenderWorker → Worker-Queue.
 */
export async function renderAndUploadVideo(
  jobId: string,
  props: ScreenshotVideoProps,
): Promise<string> {
  if (process.env.RENDER_WORKER_URL) {
    throw new Error(
      "renderAndUploadVideo darf mit RENDER_WORKER_URL nicht synchron aufgerufen werden.",
    );
  }

  if (process.env.VERCEL) {
    throw new Error(
      "RENDER_WORKER_URL fehlt. Vercel kann 3D-Videos nicht selbst rendern — starte den Render-Worker auf einem VPS.",
    );
  }

  const { buffer, contentType } = await renderVideoLocally(props, jobId);
  return uploadVideoToSupabase(jobId, buffer, contentType);
}
