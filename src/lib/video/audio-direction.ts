import type { GeneratedAudioDirection } from "../../types/video-script";
import {
  DEFAULT_AUDIO_DIRECTION,
  type AudioDirection,
} from "../../remotion/constants/audio-catalog";

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

export function shouldEnableAudio(audio: AudioDirection): boolean {
  return audio.musicStyle !== "none" || audio.transitionSfx !== "none";
}

export { DEFAULT_AUDIO_DIRECTION };
