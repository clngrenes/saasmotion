import { z } from "zod";
import { CAMERA_PRESET_NAMES } from "../types/screenshot-video";

export const videoSceneSchema = z.object({
  screenshotUrl: z.string().url(),
  headline: z.string().min(1).max(120),
  subline: z.string().max(200),
});

export const screenshotVideoSchema = z.object({
  scenes: z.array(videoSceneSchema).min(1).max(8),
  productName: z.string().min(1).max(80),
  tagline: z.string().max(160),
  presetName: z.enum(CAMERA_PRESET_NAMES),
  durationInFrames: z.number().int().positive(),
  backgroundMusicUrl: z.string().min(1),
  transitionSfxUrl: z.string().min(1),
  enableAudio: z.boolean(),
  logoUrl: z.string().url().optional(),
});

export type ScreenshotVideoSchema = z.infer<typeof screenshotVideoSchema>;
