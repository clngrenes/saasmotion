import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BUNDLE_DIR = ".remotion";

const REQUIRED_BUNDLE_AUDIO = [
  "public/audio/music-cinematic.mp3",
  "public/audio/music-ambient.mp3",
  "public/audio/music-upbeat.mp3",
  "public/audio/music-minimal.mp3",
  "public/audio/music-tech.mp3",
  "public/audio/whoosh.mp3",
  "public/audio/sfx-soft.mp3",
  "public/audio/sfx-pop.mp3",
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
  } catch (error) {
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
    throw new Error(`Remotion bundle failed: ${stderr}`);
  }

  if (!bundleHasAllAudio(bundleDir)) {
    throw new Error("Remotion bundle missing audio assets in public/audio/");
  }
}
