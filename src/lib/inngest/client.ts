import { Inngest } from "inngest";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";

export type RenderRequestedEvent = {
  name: "saasmotion/render.requested";
  data: {
    jobId: string;
    props: ScreenshotVideoProps;
  };
};

export const inngest = new Inngest({
  id: "saasmotion",
});
