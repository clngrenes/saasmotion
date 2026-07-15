import type { ArtDirection } from "../art-direction/catalog";
import type { AudioDirection } from "../constants/audio-catalog";
import type { CameraPresetName, FrameStyleId } from "../types/screenshot-video";
import type { TextPresetId } from "../text-presets/catalog";
import type { VideoAspectRatioId, VideoDurationFrames } from "../art-direction/catalog";
import type { BackgroundStyleId, IntroMotionId } from "../art-direction/catalog";
import type { SceneTransitionId } from "../transitions/ids";
import type { LogoIntroBackdropId, LogoIntroMotionId } from "../motion-skills/ids";
import type { SvgMotionId } from "../motion-skills/svg/ids";

/**
 * Named creative packs founders can pick before generate.
 * Locked fields override AI art/audio direction after generation.
 */
export const STYLE_PACK_IDS = ["linear", "auto"] as const;
export type StylePackId = (typeof STYLE_PACK_IDS)[number];

export type StylePackLocks = {
  readonly cameraPreset: CameraPresetName;
  /** If omitted, AI/infer keeps frameStyle (phone vs window from screenshots) */
  readonly frameStyle?: FrameStyleId;
  readonly textPreset: TextPresetId;
  readonly background: BackgroundStyleId;
  readonly effects: ArtDirection["effects"];
  readonly style: ArtDirection["style"];
  readonly introMotion: IntroMotionId;
  readonly sceneTransition: SceneTransitionId;
  readonly logoIntroMotion: LogoIntroMotionId;
  readonly logoIntroBackdrop: LogoIntroBackdropId;
  readonly svgMotion: SvgMotionId;
  readonly aspectRatio: VideoAspectRatioId;
  readonly durationInFrames: VideoDurationFrames;
  readonly audio: Pick<
    AudioDirection,
    "musicStyle" | "musicVolume" | "transitionSfx" | "sfxVolume"
  >;
};

export type StylePack = {
  readonly id: StylePackId;
  readonly label: string;
  readonly description: string;
  readonly hint: string;
  /** Reference film this pack aims to match */
  readonly referenceUrl?: string;
  /** null = AI chooses freely (auto pack) */
  readonly locks: StylePackLocks | null;
};

/**
 * "Linear" pack — closest match to Aside / Linear-style SaaS launch films
 * (https://youtu.be/Q-f0dQ764so): 16:9, ~90s, whip zoom into UI, kinetic words,
 * blur-fade cuts, dark floating window, tech bed + soft SFX.
 */
export const STYLE_PACKS: readonly StylePack[] = [
  {
    id: "linear",
    label: "Linear",
    description: "Whip zoom into UI, kinetic text, soft cuts — premium SaaS launch",
    hint: "Best for desktop product demos",
    referenceUrl: "https://youtu.be/Q-f0dQ764so",
    locks: {
      cameraPreset: "linear-style",
      textPreset: "kinetic-words",
      background: "solid-dark",
      effects: {
        glass: false,
        dropShadow: true,
        backgroundBlur: false,
      },
      style: {
        cornerRadius: "medium",
        stroke: false,
        panelOpacity: 1,
      },
      introMotion: "scale-in",
      sceneTransition: "blur-fade",
      logoIntroMotion: "blur-fade",
      logoIntroBackdrop: "white",
      svgMotion: "ambient-blobs",
      aspectRatio: "16:9",
      durationInFrames: 2700,
      audio: {
        musicStyle: "tech",
        musicVolume: 0.42,
        transitionSfx: "soft",
        sfxVolume: 0.38,
      },
    },
  },
  {
    id: "auto",
    label: "Auto",
    description: "AI picks the look from your screenshots and brief",
    hint: "Flexible — varies per product",
    locks: null,
  },
] as const;

export const DEFAULT_STYLE_PACK: StylePackId = "linear";

export function getStylePack(id: StylePackId): StylePack {
  return STYLE_PACKS.find((p) => p.id === id) ?? STYLE_PACKS[0]!;
}

export function isStylePackId(value: string): value is StylePackId {
  return (STYLE_PACK_IDS as readonly string[]).includes(value);
}

/** Merge pack locks over AI-generated art direction */
export function applyStylePackToArtDirection(
  art: ArtDirection,
  packId: StylePackId,
): ArtDirection {
  const pack = getStylePack(packId);
  if (!pack.locks) return art;

  const L = pack.locks;
  return {
    ...art,
    cameraPreset: L.cameraPreset,
    frameStyle: L.frameStyle ?? art.frameStyle,
    textPreset: L.textPreset,
    background: L.background,
    effects: L.effects,
    style: L.style,
    introMotion: L.introMotion,
    sceneTransition: L.sceneTransition,
    logoIntroMotion: L.logoIntroMotion,
    logoIntroBackdrop: L.logoIntroBackdrop,
    svgMotion: L.svgMotion === "none" ? art.svgMotion : L.svgMotion,
    aspectRatio: L.aspectRatio,
    durationInFrames: L.durationInFrames,
    reasoning: `${art.reasoning} [style pack: ${pack.label}]`,
  };
}

/** Merge pack audio locks over AI audio direction */
export function applyStylePackToAudioDirection(
  audio: AudioDirection,
  packId: StylePackId,
  hasLogo: boolean,
): AudioDirection {
  const pack = getStylePack(packId);
  if (!pack.locks) return audio;

  return {
    ...audio,
    ...pack.locks.audio,
    playIntroRevealSfx: hasLogo,
    reasoning: `${audio.reasoning} [style pack: ${pack.label}]`,
  };
}
