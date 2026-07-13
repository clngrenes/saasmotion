import { z } from "zod";
import { CAMERA_PRESET_NAMES } from "../types/screenshot-video";

export const screenshotVideoSchema = z.object({
  screenshotUrls: z.array(z.string().url()).min(1).max(8),
  presetName: z.enum(CAMERA_PRESET_NAMES),
  durationInFrames: z.number().int().positive(),
});

export type ScreenshotVideoSchema = z.infer<typeof screenshotVideoSchema>;
