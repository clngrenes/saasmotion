import { execSync } from "child_process";

const BUNDLE_DIR = ".remotion";

let bundleReady = false;

export function getRemotionBundleDir(): string {
  return BUNDLE_DIR;
}

export function bundleRemotionProject(bundleDir: string = BUNDLE_DIR): void {
  if (bundleReady) return;

  try {
    execSync(`node_modules/.bin/remotion bundle src/remotion/index.ts --out-dir ./${bundleDir}`, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    bundleReady = true;
  } catch (error) {
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
    throw new Error(`Remotion bundle failed: ${stderr}`);
  }
}
