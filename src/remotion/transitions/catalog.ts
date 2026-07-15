import type { TransitionPresentation, TransitionTiming } from "@remotion/transitions";
import { linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  DEFAULT_TRANSITION_DURATION_FRAMES,
  type SceneTransitionId,
} from "./ids";

export {
  DEFAULT_SCENE_TRANSITION,
  DEFAULT_TRANSITION_DURATION_FRAMES,
  SCENE_TRANSITION_IDS,
  SCENE_TRANSITION_SKILL_GUIDE,
  type SceneTransitionId,
} from "./ids";

export function resolveSceneTransitionPresentation(
  id: SceneTransitionId,
): TransitionPresentation<Record<string, unknown>> {
  switch (id) {
    case "smooth-fade":
      return fade({ shouldFadeOutExitingScene: true });
    case "blur-fade":
      return fade({
        shouldFadeOutExitingScene: true,
        enterStyle: { filter: "blur(16px)" },
        exitStyle: { filter: "blur(16px)" },
      });
    case "slide-left":
      return slide({ direction: "from-right" });
    case "slide-up":
      return slide({ direction: "from-bottom" });
    case "wipe-soft":
      return wipe({ direction: "from-bottom" });
    default:
      return fade({ shouldFadeOutExitingScene: true });
  }
}

export function resolveSceneTransitionTiming(
  id: SceneTransitionId,
): TransitionTiming {
  if (id === "slide-left" || id === "slide-up") {
    return springTiming({
      durationInFrames: DEFAULT_TRANSITION_DURATION_FRAMES,
      config: { damping: 200 },
    });
  }
  return linearTiming({ durationInFrames: DEFAULT_TRANSITION_DURATION_FRAMES });
}
