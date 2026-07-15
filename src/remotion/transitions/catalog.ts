import type { TransitionPresentation, TransitionTiming } from "@remotion/transitions";
import { linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
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

function blurFadePresentation(blurPx: number) {
  return fade({
    shouldFadeOutExitingScene: true,
    enterStyle: { filter: `blur(${blurPx}px)` },
    exitStyle: { filter: `blur(${blurPx}px)` },
  });
}

export function resolveSceneTransitionPresentation(
  id: SceneTransitionId,
): TransitionPresentation<Record<string, unknown>> {
  switch (id) {
    case "smooth-fade":
      return fade({ shouldFadeOutExitingScene: true });
    case "blur-fade":
      return blurFadePresentation(16);
    case "blur-slide-up":
      return fade({
        shouldFadeOutExitingScene: true,
        enterStyle: { filter: "blur(14px)", transform: "translateY(32px)" },
        exitStyle: { filter: "blur(10px)", transform: "translateY(-16px)" },
      });
    case "blur-slide-left":
      return fade({
        shouldFadeOutExitingScene: true,
        enterStyle: { filter: "blur(14px)", transform: "translateX(40px)" },
        exitStyle: { filter: "blur(10px)", transform: "translateX(-20px)" },
      });
    case "blur-scale":
      return fade({
        shouldFadeOutExitingScene: true,
        enterStyle: { filter: "blur(18px)", transform: "scale(0.88)" },
        exitStyle: { filter: "blur(12px)", transform: "scale(1.06)" },
      });
    case "slide-left":
      return slide({ direction: "from-right" });
    case "slide-right":
      return slide({ direction: "from-left" });
    case "slide-up":
      return slide({ direction: "from-bottom" });
    case "slide-down":
      return slide({ direction: "from-top" });
    case "wipe-soft":
      return wipe({ direction: "from-bottom" });
    case "wipe-left":
      return wipe({ direction: "from-left" });
    case "flip-soft":
      return flip({ direction: "from-right", perspective: 1400 });
    default:
      return blurFadePresentation(16);
  }
}

export function resolveSceneTransitionTiming(
  id: SceneTransitionId,
): TransitionTiming {
  const duration = DEFAULT_TRANSITION_DURATION_FRAMES;
  const spring = springTiming({ durationInFrames: duration, config: { damping: 200 } });
  const linear = linearTiming({ durationInFrames: duration });

  if (
    id === "slide-left" ||
    id === "slide-right" ||
    id === "slide-up" ||
    id === "slide-down" ||
    id === "flip-soft"
  ) {
    return spring;
  }
  return linear;
}
