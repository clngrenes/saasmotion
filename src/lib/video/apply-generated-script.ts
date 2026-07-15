import type { GeneratedVideoScript } from "../../types/video-script";
import type { ArtDirection } from "../../remotion/art-direction/catalog";
import type { AudioDirection } from "../../remotion/constants/audio-catalog";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import type { UIReconstruction } from "../../types/ui-reconstruction";
import { generatedArtDirectionToArtDirection } from "./art-direction";
import {
  generatedAudioDirectionToAudioDirection,
  normalizeAudioDirection,
  shouldEnableAudio,
} from "./audio-direction";
import { buildVideoProps, mergeScenesWithCopy } from "./build-video-props";
import {
  applyStylePackToAudioDirection,
  type StylePackId,
} from "../../remotion/styles/catalog";

export type ScriptRenderConfig = {
  readonly art: ArtDirection;
  readonly audio: AudioDirection;
  readonly enableAudio: boolean;
  readonly props: ScreenshotVideoProps;
};

export function scriptToRenderConfig(
  script: GeneratedVideoScript,
  screenshotUrls: readonly string[],
  options?: {
    readonly logoUrl?: string;
    readonly previewAudio?: boolean;
    readonly uiTrees?: readonly (UIReconstruction | null | undefined)[];
    readonly stylePackId?: StylePackId;
  },
): ScriptRenderConfig {
  const stylePackId = options?.stylePackId ?? "auto";
  const art = generatedArtDirectionToArtDirection(
    script.artDirection,
    screenshotUrls.length,
    stylePackId,
  );
  const audio = applyStylePackToAudioDirection(
    normalizeAudioDirection(
      generatedAudioDirectionToAudioDirection(script.audioDirection),
      {
        hasLogo: Boolean(options?.logoUrl),
        sceneTransition: art.sceneTransition,
      },
    ),
    stylePackId,
    Boolean(options?.logoUrl),
  );
  const enableAudio =
    options?.previewAudio === true
      ? false
      : shouldEnableAudio(audio);

  const props = buildVideoProps({
    scenes: mergeScenesWithCopy(screenshotUrls, script.scenes, options?.uiTrees),
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
