import { inngest } from "../../lib/inngest/client";
import { renderVideoOnVercel } from "../../lib/render/render-video-on-vercel";
import { uploadVideoToSupabase } from "../../lib/render/upload-video-to-supabase";
import { getServiceSupabase } from "../../lib/supabase/server";

export const renderVideo = inngest.createFunction(
  {
    id: "render-video",
    retries: 1,
    triggers: [{ event: "saasmotion/render.requested" }],
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

    await step.run("mark-rendering", async () => {
      const { error } = await supabase
        .from("render_jobs")
        .update({ status: "rendering" })
        .eq("id", jobId);

      if (error) {
        throw new Error(`Failed to mark job as rendering: ${error.message}`);
      }
    });

    const videoUrl = await step.run("render-and-upload", async () => {
      const { buffer, contentType } = await renderVideoOnVercel(props);
      return uploadVideoToSupabase(jobId, buffer, contentType);
    });

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
