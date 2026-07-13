import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "fs/promises";
import os from "os";
import path from "path";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import { bundleRemotionProject, getRemotionBundleDir } from "./bundle-remotion";

export const REMOTION_COMPOSITION_ID = "ScreenshotVideo";

export type RenderedVideo = {
  buffer: Buffer;
  contentType: string;
};

export async function renderVideoLocally(
  props: ScreenshotVideoProps,
  jobId?: string,
): Promise<RenderedVideo> {
  bundleRemotionProject();
  const serveUrl = path.join(process.cwd(), getRemotionBundleDir());

  const composition = await selectComposition({
    serveUrl,
    id: REMOTION_COMPOSITION_ID,
    inputProps: props,
  });

  const outputLocation = path.join(
    os.tmpdir(),
    `saasmotion-${jobId ?? Date.now()}.mp4`,
  );

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation,
    inputProps: props,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) {
        console.log(`[render] ${Math.round(progress * 100)}%`);
      }
    },
  });

  const buffer = await fs.readFile(outputLocation);
  await fs.unlink(outputLocation).catch(() => undefined);

  return { buffer, contentType: "video/mp4" };
}
