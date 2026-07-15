import type { GeneratedArtDirection } from "../../types/video-script";
import type { BackgroundStyleId, VideoAspectRatioId, VideoDurationFrames } from "../../remotion/art-direction/catalog";
import {
  artDirectionToPanelStyle,
  BACKGROUND_CSS,
  DEFAULT_ART_DIRECTION,
  inferDurationFromSceneCount,
  VIDEO_ASPECT_RATIO_IDS,
  VIDEO_DURATION_FRAME_OPTIONS,
  type ArtDirection,
} from "../../remotion/art-direction/catalog";
import type { TextPresetId } from "../../remotion/text-presets/catalog";
import { isTextPresetId } from "../../remotion/text-presets/catalog";
import {
  SCENE_TRANSITION_IDS,
  type SceneTransitionId,
} from "../../remotion/transitions/ids";
import {
  LOGO_INTRO_BACKDROP_IDS,
  LOGO_INTRO_MOTION_IDS,
  type LogoIntroBackdropId,
  type LogoIntroMotionId,
} from "../../remotion/motion-skills/ids";
import {
  SVG_ACCENT_IDS,
  SVG_MOTION_IDS,
  type SvgAccentId,
  type SvgMotionId,
} from "../../remotion/motion-skills/svg/ids";
import type { ScreenshotVideoProps } from "../../remotion/types/screenshot-video";
import {
  applyStylePackToArtDirection,
  type StylePackId,
} from "../../remotion/styles/catalog";

export function generatedArtDirectionToArtDirection(
  generated: GeneratedArtDirection,
  sceneCount = 1,
  stylePackId: StylePackId = "auto",
): ArtDirection {
  const aspectRatio = VIDEO_ASPECT_RATIO_IDS.includes(
    generated.aspectRatio as VideoAspectRatioId,
  )
    ? (generated.aspectRatio as VideoAspectRatioId)
    : DEFAULT_ART_DIRECTION.aspectRatio;

  const durationInFrames = VIDEO_DURATION_FRAME_OPTIONS.includes(
    generated.durationInFrames as VideoDurationFrames,
  )
    ? (generated.durationInFrames as VideoDurationFrames)
    : inferDurationFromSceneCount(sceneCount);

  const base: ArtDirection = {
    reasoning: generated.reasoning,
    cameraPreset: generated.cameraPreset,
    frameStyle: generated.frameStyle,
    textPreset: isTextPresetId(generated.textPreset)
      ? generated.textPreset
      : DEFAULT_ART_DIRECTION.textPreset,
    aspectRatio,
    durationInFrames,
    background: generated.background,
    effects: generated.effects,
    style: generated.style,
    introMotion: generated.introMotion,
    sceneTransition: isSceneTransitionId(generated.sceneTransition)
      ? generated.sceneTransition
      : DEFAULT_ART_DIRECTION.sceneTransition,
    logoIntroMotion: isLogoIntroMotionId(generated.logoIntroMotion)
      ? generated.logoIntroMotion
      : DEFAULT_ART_DIRECTION.logoIntroMotion,
    logoIntroBackdrop: isLogoIntroBackdropId(generated.logoIntroBackdrop)
      ? generated.logoIntroBackdrop
      : DEFAULT_ART_DIRECTION.logoIntroBackdrop,
    svgMotion: isSvgMotionId(generated.svgMotion)
      ? generated.svgMotion
      : DEFAULT_ART_DIRECTION.svgMotion,
    svgAccent: isSvgAccentId(generated.svgAccent)
      ? generated.svgAccent
      : DEFAULT_ART_DIRECTION.svgAccent,
  };

  return applyStylePackToArtDirection(base, stylePackId);
}

function isLogoIntroMotionId(value: string): value is LogoIntroMotionId {
  return (LOGO_INTRO_MOTION_IDS as readonly string[]).includes(value);
}

function isLogoIntroBackdropId(value: string): value is LogoIntroBackdropId {
  return (LOGO_INTRO_BACKDROP_IDS as readonly string[]).includes(value);
}

function isSceneTransitionId(value: string): value is SceneTransitionId {
  return (SCENE_TRANSITION_IDS as readonly string[]).includes(value);
}

function isSvgMotionId(value: string): value is SvgMotionId {
  return (SVG_MOTION_IDS as readonly string[]).includes(value);
}

function isSvgAccentId(value: string): value is SvgAccentId {
  return (SVG_ACCENT_IDS as readonly string[]).includes(value);
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
    sceneTransition: art.sceneTransition,
    logoIntroMotion: art.logoIntroMotion,
    logoIntroBackdrop: art.logoIntroBackdrop,
    svgMotion: art.svgMotion,
    svgAccent: art.svgAccent,
  };
}

export function getBackgroundCss(background: BackgroundStyleId): string {
  return BACKGROUND_CSS[background];
}
