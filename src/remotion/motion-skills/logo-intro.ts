import { Easing, interpolate } from "remotion";
import { INTRO_DURATION_FRAMES } from "../constants/media";
import type { LogoIntroMotionId } from "./ids";

export type LogoIntroFrameStyle = {
  readonly opacity: number;
  readonly blur: number;
  readonly scale: number;
  readonly translateX: number;
  readonly translateY: number;
  readonly clipPath: string;
  readonly screenOpacity: number;
};

const ENTER_END = 22;
const HOLD_END = INTRO_DURATION_FRAMES - 16;

function enterProgress(frame: number): number {
  return interpolate(frame, [0, ENTER_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

function exitProgress(frame: number): number {
  return interpolate(frame, [HOLD_END, INTRO_DURATION_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
}

export function computeLogoIntroStyle(
  frame: number,
  motion: LogoIntroMotionId,
): LogoIntroFrameStyle {
  const enter = enterProgress(frame);
  const exit = exitProgress(frame);

  const baseOpacity = interpolate(
    frame,
    [0, ENTER_END, HOLD_END, INTRO_DURATION_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const screenOpacity = interpolate(
    frame,
    [HOLD_END - 4, INTRO_DURATION_FRAMES],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  let blur = 0;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let clipPath = "inset(0% 0% 0% 0%)";

  switch (motion) {
    case "fade":
      break;
    case "blur-fade":
      blur = frame < HOLD_END ? (1 - enter) * 22 + exit * 14 : exit * 14;
      scale = interpolate(enter, [0, 1], [0.88, 1]);
      break;
    case "blur-slide-up":
      blur = (1 - enter) * 20 + exit * 12;
      translateY = (1 - enter) * 48 - exit * 20;
      scale = interpolate(enter, [0, 1], [0.94, 1]);
      break;
    case "blur-slide-left":
      blur = (1 - enter) * 20 + exit * 12;
      translateX = (1 - enter) * 56 - exit * 24;
      scale = interpolate(enter, [0, 1], [0.94, 1]);
      break;
    case "blur-scale":
      blur = (1 - enter) * 24 + exit * 16;
      scale = interpolate(enter, [0, 1], [0.72, 1]);
      break;
    case "scale-grow":
      scale = interpolate(enter, [0, 1], [0.78, 1]);
      break;
    case "slide-up":
      translateY = (1 - enter) * 64 - exit * 24;
      break;
    case "slide-left":
      translateX = (1 - enter) * 72 - exit * 28;
      break;
    case "mask-reveal-up":
      clipPath = `inset(${(1 - enter) * 100}% 0% 0% 0%)`;
      scale = interpolate(enter, [0, 1], [1.04, 1]);
      break;
    case "mask-reveal-center":
      clipPath = `circle(${(enter * 72).toFixed(1)}% at 50% 50%)`;
      scale = interpolate(enter, [0, 1], [0.92, 1]);
      break;
    default:
      blur = (1 - enter) * 22;
      scale = interpolate(enter, [0, 1], [0.88, 1]);
  }

  return {
    opacity: baseOpacity,
    blur,
    scale,
    translateX,
    translateY,
    clipPath,
    screenOpacity,
  };
}
