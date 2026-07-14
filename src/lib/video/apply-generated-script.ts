import type { GeneratedVideoScript } from "../../types/video-script";
import type { ArtDirection } from "../../remotion/art-direction/catalog";
import type { AudioDirection } from "../../remotion/constants/audio-catalog";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import { generatedArtDirectionToArtDirection } from "./art-direction";
import {
  generatedAudioDirectionToAudioDirection,
  shouldEnableAudio,
} from "./audio-direction";
import { buildVideoProps, mergeScenesWithCopy } from "./build-video-props";

export type ScriptRenderConfig = {
  readonly art: ArtDirection;
  readonly audio: AudioDirection;
  readonly enableAudio: boolean;
  readonly props: ScreenshotVideoProps;
};

export function scriptToRenderConfig(
  script: GeneratedVideoScript,
  screenshotUrls: readonly string[],
  options?: { readonly logoUrl?: string; readonly previewAudio?: boolean },
): ScriptRenderConfig {
  const art = generatedArtDirectionToArtDirection(
    script.artDirection,
    screenshotUrls.length,
  );
  const audio = generatedAudioDirectionToAudioDirection(script.audioDirection);
  const enableAudio = options?.previewAudio
    ? false
    : shouldEnableAudio(audio);

  const props = buildVideoProps({
    scenes: mergeScenesWithCopy(screenshotUrls, script.scenes),
    productName: script.productName,
    tagline: script.tagline,
    presetName: art.cameraPreset,
    durationInFrames: art.durationInFrames,
    aspectRatio: art.aspectRatio,
    textPreset: art.textPreset,
    enableAudio,
    logoUrl: options?.logoUrl,
    frameStyle: art.frameStyle,
    artDirection: art,
    audioDirection: audio,
  });

  return { art, audio, enableAudio, props };
}
