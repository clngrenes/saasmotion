import {
  addBundleToSandbox,
  createSandbox,
  renderMediaOnVercel,
} from "@remotion/vercel";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import { bundleRemotionProject, getRemotionBundleDir } from "./bundle-remotion";
import { restoreSandboxFromSnapshot } from "./restore-snapshot";

export const REMOTION_COMPOSITION_ID = "ScreenshotVideo";

export type RenderedVideo = {
  buffer: Buffer;
  contentType: string;
};

export async function renderVideoOnVercel(
  props: ScreenshotVideoProps,
): Promise<RenderedVideo> {
  const useSnapshot = Boolean(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN);

  const sandbox = useSnapshot
    ? await restoreSandboxFromSnapshot()
    : await createSandbox({
        onProgress: async ({ progress, message }) => {
          console.log(`[sandbox] ${message} (${Math.round(progress * 100)}%)`);
        },
      });

  try {
    if (!useSnapshot) {
      bundleRemotionProject();
      await addBundleToSandbox({
        sandbox,
        bundleDir: getRemotionBundleDir(),
      });
    }

    const { sandboxFilePath, contentType } = await renderMediaOnVercel({
      sandbox,
      compositionId: REMOTION_COMPOSITION_ID,
      inputProps: props,
      onProgress: async (update) => {
        console.log(
          `[render] ${update.stage}: ${Math.round(update.overallProgress * 100)}%`,
        );
      },
    });

    const buffer = await sandbox.readFileToBuffer({ path: sandboxFilePath });
    if (!buffer) {
      throw new Error(`Rendered video not found at ${sandboxFilePath}`);
    }

    return { buffer, contentType };
  } finally {
    await sandbox.stop().catch(() => undefined);
  }
}
