import { getTransitionStartFrames } from "./slide-timing";
import type { SfxStyleId } from "../constants/audio-catalog";
import { SFX_DURATION_SECONDS } from "../constants/audio-catalog";
import { DEFAULT_TRANSITION_DURATION_FRAMES } from "../transitions/ids";

/** Frames before the visual cut where SFX should start so the peak hits the transition */
const SFX_PEAK_OFFSET: Record<Exclude<SfxStyleId, "none">, number> = {
  whoosh: 5,
  soft: 3,
  pop: 2,
};

export type AudioCue = {
  readonly frame: number;
  readonly type: "intro-reveal" | "scene-transition";
};

export function sfxDurationInFrames(
  sfx: SfxStyleId,
  fps: number,
): number {
  if (sfx === "none") return 0;
  return Math.max(1, Math.ceil(SFX_DURATION_SECONDS[sfx] * fps));
}

/** Berechnet exakte Frame-Positionen für alle Audio-Cues */
export function getAudioCues(input: {
  readonly durationInFrames: number;
  readonly slideCount: number;
  readonly introDurationFrames: number;
  readonly playIntroRevealSfx: boolean;
  readonly transitionSfx: SfxStyleId;
  readonly fps?: number;
  readonly transitionDurationFrames?: number;
}): AudioCue[] {
  const fps = input.fps ?? 30;
  const cues: AudioCue[] = [];
  const transitionDuration =
    input.transitionDurationFrames ?? DEFAULT_TRANSITION_DURATION_FRAMES;

  if (input.transitionSfx === "none") {
    return cues;
  }

  const peakOffset = SFX_PEAK_OFFSET[input.transitionSfx];
  const contentDuration = Math.max(1, input.durationInFrames - input.introDurationFrames);
  const transitionStarts = getTransitionStartFrames(
    contentDuration,
    input.slideCount,
    transitionDuration,
  );

  if (input.playIntroRevealSfx) {
    const introCut = input.introDurationFrames;
    cues.push({
      frame: Math.max(0, introCut - peakOffset),
      type: "intro-reveal",
    });
  }

  for (const contentStart of transitionStarts) {
    const absoluteCut = input.introDurationFrames + contentStart;
    cues.push({
      frame: Math.max(0, absoluteCut - peakOffset),
      type: "scene-transition",
    });
  }

  return cues;
}
