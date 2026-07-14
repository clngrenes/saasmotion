import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  type VideoAspectRatioId,
} from "../../remotion/constants/aspect-ratio";
import {
  DEFAULT_BACKGROUND_MUSIC_URL,
  DEFAULT_TRANSITION_SFX_URL,
} from "../../remotion/constants/media";
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
  enableAudio?: boolean;
  backgroundMusicUrl?: string;
  transitionSfxUrl?: string;
  logoUrl?: string;
}): ScreenshotVideoProps {
  return {
    scenes: input.scenes,
    productName: input.productName,
    tagline: input.tagline,
    presetName: input.presetName,
    durationInFrames: input.durationInFrames,
    aspectRatio: input.aspectRatio ?? DEFAULT_VIDEO_ASPECT_RATIO,
    enableAudio: input.enableAudio ?? true,
    backgroundMusicUrl: input.backgroundMusicUrl ?? DEFAULT_BACKGROUND_MUSIC_URL,
    transitionSfxUrl: input.transitionSfxUrl ?? DEFAULT_TRANSITION_SFX_URL,
    logoUrl: input.logoUrl,
  };
}
