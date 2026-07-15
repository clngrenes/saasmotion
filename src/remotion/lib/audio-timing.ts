import { getTransitionStartFrames } from "./slide-timing";
import type { SfxStyleId } from "../constants/audio-catalog";
import { SFX_DURATION_SECONDS } from "../constants/audio-catalog";
import { DEFAULT_TRANSITION_DURATION_FRAMES } from "../transitions/ids";

/**
 * Frame index inside the SFX clip (at 30fps) where the perceptual "hit" lands.
 * Cue start = transitionStart - impactFrame → hit aligns with the visual cut.
 */
const SFX_IMPACT_FRAME: Record<Exclude<SfxStyleId, "none">, number> = {
  whoosh: 8,
  soft: 4,
  pop: 1,
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

function impactLeadFrames(sfx: SfxStyleId, fps: number): number {
  if (sfx === "none") return 0;
  const at30 = SFX_IMPACT_FRAME[sfx];
  return Math.max(1, Math.round(at30 * (fps / 30)));
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

  const lead = impactLeadFrames(input.transitionSfx, fps);
  const contentDuration = Math.max(1, input.durationInFrames - input.introDurationFrames);
  const transitionStarts = getTransitionStartFrames(
    contentDuration,
    input.slideCount,
    transitionDuration,
  );

  if (input.playIntroRevealSfx && input.introDurationFrames > 0) {
    cues.push({
      frame: Math.max(0, input.introDurationFrames - lead),
      type: "intro-reveal",
    });
  }

  for (const contentStart of transitionStarts) {
    const transitionStart = input.introDurationFrames + contentStart;
    cues.push({
      frame: Math.max(0, transitionStart - lead),
      type: "scene-transition",
    });
  }

  return cues;
}
