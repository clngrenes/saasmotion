import {
  DEFAULT_ART_DIRECTION,
  artDirectionToPanelStyle,
} from "../../remotion/art-direction/catalog";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  type VideoAspectRatioId,
} from "../../remotion/constants/aspect-ratio";
import {
  DEFAULT_TEXT_PRESET,
  type TextPresetId,
} from "../../remotion/text-presets/catalog";
import {
  DEFAULT_BACKGROUND_MUSIC_URL,
  DEFAULT_TRANSITION_SFX_URL,
} from "../../remotion/constants/media";
import {
  DEFAULT_AUDIO_DIRECTION,
  resolveMusicFile,
  resolveSfxFile,
  type AudioDirection,
} from "../../remotion/constants/audio-catalog";
import type {
  ArtDirection,
  BackgroundStyleId,
  IntroMotionId,
  PanelVisualStyle,
} from "../../remotion/art-direction/catalog";
import type { CameraPresetName, VideoScene } from "../../remotion/types/screenshot-video";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import type { GeneratedSceneCopy } from "../../types/video-script";

export function buildDefaultSceneCopy(
  index: number,
  total: number,
): GeneratedSceneCopy {
  if (index === 0) {
    return {
      headline: "Your product, beautifully shown",
      subline: "Turn screenshots into cinematic demos",
    };
  }

  return {
    headline: `Feature ${index + 1}`,
    subline: total > 2 ? "Built for modern SaaS teams" : "",
  };
}

export function mergeScenesWithCopy(
  screenshotUrls: readonly string[],
  copy: readonly GeneratedSceneCopy[],
): VideoScene[] {
  return screenshotUrls.map((screenshotUrl, index) => {
    const sceneCopy = copy[index] ?? buildDefaultSceneCopy(index, screenshotUrls.length);
    return {
      screenshotUrl,
      headline: sceneCopy.headline,
      subline: sceneCopy.subline,
    };
  });
}

export function buildVideoProps(input: {
  scenes: readonly VideoScene[];
  productName: string;
  tagline: string;
  presetName: CameraPresetName;
  durationInFrames: number;
  aspectRatio?: VideoAspectRatioId;
  textPreset?: TextPresetId;
  enableAudio?: boolean;
  backgroundMusicUrl?: string;
  transitionSfxUrl?: string;
  logoUrl?: string;
  frameStyle?: "phone" | "window";
  artDirection?: ArtDirection;
  background?: BackgroundStyleId;
  panelStyle?: PanelVisualStyle;
  introMotion?: IntroMotionId;
  audioDirection?: AudioDirection;
}): ScreenshotVideoProps {
  const art = input.artDirection ?? DEFAULT_ART_DIRECTION;
  const audio = input.audioDirection ?? DEFAULT_AUDIO_DIRECTION;
  const musicFile = resolveMusicFile(audio.musicStyle);
  const sfxFile = resolveSfxFile(audio.transitionSfx);

  return {
    scenes: input.scenes,
    productName: input.productName,
    tagline: input.tagline,
    presetName: input.presetName,
    durationInFrames: input.durationInFrames,
    aspectRatio: input.aspectRatio ?? DEFAULT_VIDEO_ASPECT_RATIO,
    textPreset: input.textPreset ?? art.textPreset,
    enableAudio: input.enableAudio ?? true,
    backgroundMusicUrl:
      input.backgroundMusicUrl ?? musicFile ?? DEFAULT_BACKGROUND_MUSIC_URL,
    transitionSfxUrl:
      input.transitionSfxUrl ?? sfxFile ?? DEFAULT_TRANSITION_SFX_URL,
    logoUrl: input.logoUrl,
    frameStyle: input.frameStyle ?? art.frameStyle,
    background: input.background ?? art.background,
    panelStyle: input.panelStyle ?? artDirectionToPanelStyle(art),
    introMotion: input.introMotion ?? art.introMotion,
    sceneTransition: art.sceneTransition,
    audioDirection: audio,
  };
}
