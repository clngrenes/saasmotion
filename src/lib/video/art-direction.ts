import type { GeneratedArtDirection } from "../../types/video-script";
import type { BackgroundStyleId } from "../../remotion/art-direction/catalog";
import {
  artDirectionToPanelStyle,
  BACKGROUND_CSS,
  DEFAULT_ART_DIRECTION,
  type ArtDirection,
} from "../../remotion/art-direction/catalog";
import type { TextPresetId } from "../../remotion/text-presets/catalog";
import { isTextPresetId } from "../../remotion/text-presets/catalog";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";

export function generatedArtDirectionToArtDirection(
  generated: GeneratedArtDirection,
): ArtDirection {
  return {
    reasoning: generated.reasoning,
    cameraPreset: generated.cameraPreset,
    frameStyle: generated.frameStyle,
    textPreset: isTextPresetId(generated.textPreset)
      ? generated.textPreset
      : DEFAULT_ART_DIRECTION.textPreset,
    background: generated.background,
    effects: generated.effects,
    style: generated.style,
    introMotion: generated.introMotion,
  };
}

export function applyArtDirectionToProps(
  props: ScreenshotVideoProps,
  art: ArtDirection,
): ScreenshotVideoProps {
  return {
    ...props,
    presetName: art.cameraPreset,
    frameStyle: art.frameStyle,
    textPreset: art.textPreset as TextPresetId,
    background: art.background,
    panelStyle: artDirectionToPanelStyle(art),
    introMotion: art.introMotion,
  };
}

export function getBackgroundCss(background: BackgroundStyleId): string {
  return BACKGROUND_CSS[background];
}
