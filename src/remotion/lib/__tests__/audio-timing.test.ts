import { describe, expect, it } from "vitest";
import { INTRO_DURATION_FRAMES } from "../../constants/media";
import { DEFAULT_TRANSITION_DURATION_FRAMES } from "../../transitions/ids";
import { getAudioCues } from "../audio-timing";
import { getTransitionStartFrames } from "../slide-timing";

describe("getAudioCues", () => {
  it("places intro reveal SFX before the intro cut", () => {
    const cues = getAudioCues({
      durationInFrames: 900,
      slideCount: 3,
      introDurationFrames: INTRO_DURATION_FRAMES,
      playIntroRevealSfx: true,
      transitionSfx: "whoosh",
      fps: 30,
    });

    const introCue = cues.find((c) => c.type === "intro-reveal");
    expect(introCue).toBeDefined();
    expect(introCue!.frame).toBe(INTRO_DURATION_FRAMES - 5);
  });

  it("places scene transition SFX before each smooth transition", () => {
    const cues = getAudioCues({
      durationInFrames: 900,
      slideCount: 3,
      introDurationFrames: INTRO_DURATION_FRAMES,
      playIntroRevealSfx: false,
      transitionSfx: "whoosh",
      fps: 30,
      transitionDurationFrames: DEFAULT_TRANSITION_DURATION_FRAMES,
    });

    const transitions = cues.filter((c) => c.type === "scene-transition");
    expect(transitions).toHaveLength(2);

    const contentDuration = 900 - INTRO_DURATION_FRAMES;
    const transitionStarts = getTransitionStartFrames(contentDuration, 3);

    expect(transitions[0].frame).toBe(
      INTRO_DURATION_FRAMES + transitionStarts[0] - 5,
    );
    expect(transitions[1].frame).toBe(
      INTRO_DURATION_FRAMES + transitionStarts[1] - 5,
    );
  });

  it("returns no cues when sfx is none", () => {
    const cues = getAudioCues({
      durationInFrames: 900,
      slideCount: 2,
      introDurationFrames: INTRO_DURATION_FRAMES,
      playIntroRevealSfx: true,
      transitionSfx: "none",
      fps: 30,
    });

    expect(cues).toHaveLength(0);
  });
});
