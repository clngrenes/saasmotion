import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";

export type DispatchRenderResult = {
  accepted: boolean;
  queue?: {
    queued: number;
    active: number;
    concurrency: number;
  };
};

/** Schickt Job an den VPS-Worker — antwortet sofort (202), Rendering läuft asynchron. */
export async function dispatchRenderWorker(
  jobId: string,
  props: ScreenshotVideoProps,
): Promise<DispatchRenderResult> {
  const workerUrl = process.env.RENDER_WORKER_URL;
  const secret = process.env.RENDER_WORKER_SECRET;

  if (!workerUrl) {
    throw new Error("RENDER_WORKER_URL fehlt.");
  }
  if (!secret) {
    throw new Error("RENDER_WORKER_SECRET fehlt.");
  }

  const response = await fetch(`${workerUrl.replace(/\/$/, "")}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ jobId, props }),
  });

  const body = (await response.json().catch(() => null)) as {
    error?: string;
    accepted?: boolean;
    queue?: DispatchRenderResult["queue"];
  } | null;

  if (!response.ok) {
    throw new Error(body?.error ?? `Render worker failed (${response.status})`);
  }

  return {
    accepted: body?.accepted ?? true,
    queue: body?.queue,
  };
}
