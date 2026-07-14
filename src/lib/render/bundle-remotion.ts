import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BUNDLE_DIR = ".remotion";

export function getRemotionBundleDir(): string {
  return BUNDLE_DIR;
}

export function bundleRemotionProject(bundleDir: string = BUNDLE_DIR): void {
  const requiredAudio = path.join(
    process.cwd(),
    "public/audio/music-cinematic.mp3",
  );
  const bundledAudio = path.join(process.cwd(), bundleDir, "public/audio/music-cinematic.mp3");
  const bundleExists = fs.existsSync(path.join(process.cwd(), bundleDir, "index.html"));

  if (bundleExists && fs.existsSync(bundledAudio) && fs.existsSync(requiredAudio)) {
    return;
  }

  if (fs.existsSync(path.join(process.cwd(), bundleDir))) {
    fs.rmSync(path.join(process.cwd(), bundleDir), { recursive: true, force: true });
  }

  try {
    execSync(`node_modules/.bin/remotion bundle src/remotion/index.ts --out-dir ./${bundleDir}`, {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  } catch (error) {
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
    throw new Error(`Remotion bundle failed: ${stderr}`);
  }
}
