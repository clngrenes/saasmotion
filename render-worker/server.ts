import { bundleRemotionProject } from "../src/lib/render/bundle-remotion";
import type { ScreenshotVideoProps } from "../src/remotion/types/screenshot-video";
import { RenderQueue } from "./queue";

const PORT = Number(process.env.RENDER_WORKER_PORT ?? 3100);
const CONCURRENCY = Number(process.env.RENDER_CONCURRENCY ?? 1);

const queue = new RenderQueue(CONCURRENCY);

function readBody(request: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function isAuthorized(request: import("node:http").IncomingMessage): boolean {
  const secret = process.env.RENDER_WORKER_SECRET;
  if (!secret) return false;
  return request.headers.authorization === `Bearer ${secret}`;
}

async function handleRender(request: import("node:http").IncomingMessage) {
  if (!isAuthorized(request)) {
    return { status: 401, body: { error: "Unauthorized" } };
  }

  const payload = JSON.parse(await readBody(request)) as {
    jobId: string;
    props: ScreenshotVideoProps;
  };

  const { jobId, props } = payload;
  if (!jobId || !props) {
    return { status: 400, body: { error: "Missing jobId or props" } };
  }

  queue.accept(jobId, props);

  return {
    status: 202,
    body: {
      accepted: true,
      jobId,
      queue: queue.stats,
    },
  };
}

async function main() {
  console.log("[render-worker] bundling Remotion project (once)...");
  bundleRemotionProject();
  console.log("[render-worker] bundle ready");

  const { createServer } = await import("node:http");

  createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, queue: queue.stats }));
      return;
    }

    if (request.method === "POST" && request.url === "/render") {
      const result = await handleRender(request);
      response.writeHead(result.status, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result.body));
      return;
    }

    response.writeHead(404);
    response.end();
  }).listen(PORT, () => {
    console.log(
      `[render-worker] listening on :${PORT} (concurrency=${CONCURRENCY})`,
    );
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
