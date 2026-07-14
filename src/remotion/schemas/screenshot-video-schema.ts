import { z } from "zod";
import {
  BACKGROUND_STYLE_IDS,
  CORNER_RADIUS_IDS,
  INTRO_MOTION_IDS,
} from "../art-direction/catalog";
import {
  MUSIC_STYLE_IDS,
  SFX_STYLE_IDS,
} from "../constants/audio-catalog";
import { VIDEO_ASPECT_RATIO_OPTIONS } from "../constants/aspect-ratio";
import { TEXT_PRESET_IDS } from "../text-presets/catalog";
import { CAMERA_PRESET_NAMES } from "../types/screenshot-video";

const aspectRatioIds = VIDEO_ASPECT_RATIO_OPTIONS.map((o) => o.id) as [
  (typeof VIDEO_ASPECT_RATIO_OPTIONS)[number]["id"],
  ...(typeof VIDEO_ASPECT_RATIO_OPTIONS)[number]["id"][],
];

const textPresetIds = TEXT_PRESET_IDS as [
  (typeof TEXT_PRESET_IDS)[number],
  ...(typeof TEXT_PRESET_IDS)[number][],
];

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
  aspectRatio: z.enum(aspectRatioIds),
  textPreset: z.enum(textPresetIds),
  backgroundMusicUrl: z.string().min(1),
  transitionSfxUrl: z.string().min(1),
  enableAudio: z.boolean(),
  logoUrl: z.string().url().optional(),
  frameStyle: z.enum(["phone", "window"]).default("window"),
  background: z.enum(BACKGROUND_STYLE_IDS).default("dark-gradient"),
  panelStyle: z.object({
    cornerRadius: z.enum(CORNER_RADIUS_IDS),
    glass: z.boolean(),
    dropShadow: z.boolean(),
    stroke: z.boolean(),
    panelOpacity: z.number().min(0.8).max(1),
    backgroundBlur: z.boolean(),
  }),
  introMotion: z.enum(INTRO_MOTION_IDS).default("scale-in"),
  audioDirection: z.object({
    reasoning: z.string().max(300),
    musicStyle: z.enum(MUSIC_STYLE_IDS),
    musicVolume: z.number().min(0.08).max(0.28),
    transitionSfx: z.enum(SFX_STYLE_IDS),
    sfxVolume: z.number().min(0.18).max(0.45),
    playIntroRevealSfx: z.boolean(),
  }),
});

export type ScreenshotVideoSchema = z.infer<typeof screenshotVideoSchema>;
