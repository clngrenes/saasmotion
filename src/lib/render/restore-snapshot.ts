import { get } from "@vercel/blob";
import { Sandbox } from "@vercel/sandbox";

const SANDBOX_CREATING_TIMEOUT = 5 * 60 * 1000;

const getSnapshotBlobKey = () =>
  `snapshot-cache/${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}.json`;

export async function restoreSandboxFromSnapshot() {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Create a Vercel Blob store and link it to this project.",
    );
  }

  const blob = await get(getSnapshotBlobKey(), {
    access: "public",
    token: blobToken,
  });

  if (!blob) {
    throw new Error(
      "No sandbox snapshot found. Run `npm run create-snapshot` during the build step.",
    );
  }

  const response = new Response(blob.stream);
  const cache = (await response.json()) as { snapshotId?: string };
  const snapshotId = cache.snapshotId;

  if (!snapshotId) {
    throw new Error(
      "Invalid snapshot cache. Run `npm run create-snapshot` during the build step.",
    );
  }

  return Sandbox.create({
    source: { type: "snapshot", snapshotId },
    timeout: SANDBOX_CREATING_TIMEOUT,
  });
}
