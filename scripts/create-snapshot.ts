import { put } from "@vercel/blob";
import { addBundleToSandbox, createSandbox } from "@remotion/vercel";
import { bundleRemotionProject, getRemotionBundleDir } from "../src/lib/render/bundle-remotion";

const getSnapshotBlobKey = () =>
  `snapshot-cache/${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}.json`;

async function main() {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required. Create a Vercel Blob store and link it to this project.",
    );
  }

  const sandbox = await createSandbox({
    onProgress: ({ progress, message }) => {
      const pct = Math.round(progress * 100);
      console.log(`[create-snapshot] ${message} (${pct}%)`);
    },
  });

  console.log("[create-snapshot] Bundling Remotion project...");
  bundleRemotionProject();

  console.log("[create-snapshot] Uploading bundle to sandbox...");
  await addBundleToSandbox({
    sandbox,
    bundleDir: getRemotionBundleDir(),
  });

  console.log("[create-snapshot] Taking snapshot...");
  const snapshot = await sandbox.snapshot({ expiration: 0 });
  const { snapshotId } = snapshot;

  await put(getSnapshotBlobKey(), JSON.stringify({ snapshotId }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    token: blobToken,
  });

  console.log(`[create-snapshot] Snapshot saved: ${snapshotId}`);
  await sandbox.stop().catch(() => undefined);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
