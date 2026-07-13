import { inngest } from "../../lib/inngest/client";
import { dispatchRenderWorker } from "../../lib/render/dispatch-render-worker";
import { renderAndUploadVideo } from "../../lib/render/render-and-upload";
import { getRenderJobSnapshot } from "../../lib/render/wait-for-render-job";
import { getServiceSupabase } from "../../lib/supabase/server";

const POLL_INTERVAL = "5s";
const MAX_POLL_ATTEMPTS = 120; // ~10 min

export const renderVideo = inngest.createFunction(
  {
    id: "render-video",
    retries: 1,
    triggers: [{ event: "saasmotion/render.requested" }],
    concurrency: {
      limit: 100,
    },
    onFailure: async ({ event, error }) => {
      const jobId = event.data.event.data.jobId;
      const supabase = getServiceSupabase();

      await supabase
        .from("render_jobs")
        .update({
          status: "failed",
          error_details: error.message,
        })
        .eq("id", jobId);
    },
  },
  async ({ event, step }) => {
    const { jobId, props } = event.data;
    const supabase = getServiceSupabase();
    const usesWorker = Boolean(process.env.RENDER_WORKER_URL);

    await step.run("mark-rendering", async () => {
      const { error } = await supabase
        .from("render_jobs")
        .update({ status: "rendering" })
        .eq("id", jobId);

      if (error) {
        throw new Error(`Failed to mark job as rendering: ${error.message}`);
      }
    });

    if (usesWorker) {
      await step.run("dispatch-to-worker", async () =>
        dispatchRenderWorker(jobId, props),
      );

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        const snapshot = await step.run(`poll-status-${attempt}`, async () =>
          getRenderJobSnapshot(jobId),
        );

        if (snapshot.status === "done" && snapshot.videoUrl) {
          return { jobId, videoUrl: snapshot.videoUrl };
        }

        if (snapshot.status === "failed") {
          throw new Error(snapshot.errorDetails ?? "Render failed");
        }

        await step.sleep(`wait-${attempt}`, POLL_INTERVAL);
      }

      throw new Error("Render timeout — worker queue may be overloaded");
    }

    const videoUrl = await step.run("render-and-upload-local", async () =>
      renderAndUploadVideo(jobId, props),
    );

    await step.run("mark-done", async () => {
      const { error } = await supabase
        .from("render_jobs")
        .update({
          status: "done",
          s3_video_url: videoUrl,
        })
        .eq("id", jobId);

      if (error) {
        throw new Error(`Failed to mark job as done: ${error.message}`);
      }
    });

    return { jobId, videoUrl };
  },
);
