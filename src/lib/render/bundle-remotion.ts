import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BUNDLE_DIR = ".remotion";

const REQUIRED_BUNDLE_AUDIO = [
  "audio/music-cinematic.mp3",
  "audio/music-ambient.mp3",
  "audio/music-upbeat.mp3",
  "audio/music-minimal.mp3",
  "audio/music-tech.mp3",
  "audio/whoosh.mp3",
  "audio/sfx-soft.mp3",
  "audio/sfx-pop.mp3",
] as const;

export function getRemotionBundleDir(): string {
  return BUNDLE_DIR;
}

function bundleHasAllAudio(bundleDir: string): boolean {
  const root = path.join(process.cwd(), bundleDir);
  return REQUIRED_BUNDLE_AUDIO.every((rel) => fs.existsSync(path.join(root, rel)));
}

export function bundleRemotionProject(bundleDir: string = BUNDLE_DIR): void {
  const bundleExists = fs.existsSync(path.join(process.cwd(), bundleDir, "index.html"));

  if (bundleExists && bundleHasAllAudio(bundleDir)) {
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
    // Remotion 4.x sometimes nests the public folder inside the bundle dir
    // We explicitly copy the contents of public/ to the root of the bundle dir
    // so staticFile("audio/...") correctly resolves to [serveUrl]/audio/...
    if (fs.existsSync(path.join(process.cwd(), "public"))) {
      execSync(`cp -R public/* ${bundleDir}/`, { cwd: process.cwd() });
    }
  } catch (error) {
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
    throw new Error(`Remotion bundle failed: ${stderr}`);
  }

  if (!bundleHasAllAudio(bundleDir)) {
    throw new Error("Remotion bundle missing audio assets in public/audio/");
  }
}
