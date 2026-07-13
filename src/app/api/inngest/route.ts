import { serve } from "inngest/next";
import { renderVideo } from "../../../inngest/functions/render-video";
import { inngest } from "../../../lib/inngest/client";

export const maxDuration = 800;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [renderVideo],
});
