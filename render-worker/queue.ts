import { renderVideoLocally } from "../src/lib/render/render-video-local";
import { uploadVideoToSupabase } from "../src/lib/render/upload-video-to-supabase";
import { getServiceSupabase } from "../src/lib/supabase/server";
import type { ScreenshotVideoProps } from "../src/remotion/types/screenshot-video";

type QueueJob = {
  jobId: string;
  props: ScreenshotVideoProps;
};

export type QueueStats = {
  queued: number;
  active: number;
  concurrency: number;
};

export class RenderQueue {
  private readonly pending: QueueJob[] = [];
  private active = 0;
  private readonly concurrency: number;

  constructor(concurrency: number) {
    this.concurrency = Math.max(1, concurrency);
  }

  get stats(): QueueStats {
    return {
      queued: this.pending.length,
      active: this.active,
      concurrency: this.concurrency,
    };
  }

  /** Nimmt Job an und verarbeitet ihn asynchron (FIFO). */
  accept(jobId: string, props: ScreenshotVideoProps): void {
    this.pending.push({ jobId, props });
    this.drain();
  }

  private drain(): void {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const job = this.pending.shift();
      if (!job) return;

      this.active++;
      void this.process(job).finally(() => {
        this.active--;
        this.drain();
      });
    }
  }

  private async process({ jobId, props }: QueueJob): Promise<void> {
    const supabase = getServiceSupabase();

    try {
      const { buffer, contentType } = await renderVideoLocally(props, jobId);
      const videoUrl = await uploadVideoToSupabase(jobId, buffer, contentType);

      const { error } = await supabase
        .from("render_jobs")
        .update({
          status: "done",
          s3_video_url: videoUrl,
          error_details: null,
        })
        .eq("id", jobId);

      if (error) {
        throw new Error(`Failed to mark job done: ${error.message}`);
      }

      console.log(`[render-worker] job ${jobId} done`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Render failed";
      console.error(`[render-worker] job ${jobId} failed:`, message);

      await supabase
        .from("render_jobs")
        .update({
          status: "failed",
          error_details: message,
        })
        .eq("id", jobId);
    }
  }
}
