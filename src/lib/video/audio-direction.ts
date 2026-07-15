import type { GeneratedAudioDirection } from "../../types/video-script";
import type { SceneTransitionId } from "../../remotion/transitions/ids";
import {
  DEFAULT_AUDIO_DIRECTION,
  type AudioDirection,
  type MusicStyleId,
  type SfxStyleId,
} from "../../remotion/constants/audio-catalog";

function sfxForSceneTransition(transition: SceneTransitionId): SfxStyleId {
  if (
    transition.startsWith("slide-") ||
    transition === "flip-soft" ||
    transition === "blur-slide-up" ||
    transition === "blur-slide-left" ||
    transition === "blur-scale" ||
    transition === "wipe-soft" ||
    transition === "wipe-left"
  ) {
    return "whoosh";
  }
  return "soft";
}

export function generatedAudioDirectionToAudioDirection(
  generated: GeneratedAudioDirection,
): AudioDirection {
  return {
    reasoning: generated.reasoning,
    musicStyle: generated.musicStyle,
    musicVolume: generated.musicVolume,
    transitionSfx: generated.transitionSfx,
    sfxVolume: generated.sfxVolume,
    playIntroRevealSfx: generated.playIntroRevealSfx,
  };
}

/** Keeps AI picks in a sane range and locks SFX to visual transitions */
export function normalizeAudioDirection(
  audio: AudioDirection,
  options?: {
    readonly hasLogo?: boolean;
    readonly sceneTransition?: SceneTransitionId;
  },
): AudioDirection {
  const musicStyle: MusicStyleId =
    audio.musicStyle === "none" ? "cinematic" : audio.musicStyle;

  let transitionSfx: SfxStyleId = audio.transitionSfx;
  if (transitionSfx === "none" && options?.sceneTransition) {
    transitionSfx = sfxForSceneTransition(options.sceneTransition);
  } else if (options?.sceneTransition) {
    transitionSfx = sfxForSceneTransition(options.sceneTransition);
  }

  return {
    ...audio,
    musicStyle,
    musicVolume: Math.min(0.28, Math.max(0.15, audio.musicVolume)),
    transitionSfx,
    sfxVolume: Math.min(0.42, Math.max(0.24, audio.sfxVolume)),
    playIntroRevealSfx:
      Boolean(options?.hasLogo) && audio.playIntroRevealSfx,
  };
}

export function shouldEnableAudio(audio: AudioDirection): boolean {
  return audio.musicStyle !== "none" || audio.transitionSfx !== "none";
}

export { DEFAULT_AUDIO_DIRECTION };
