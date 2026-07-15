import { Easing, interpolate } from "remotion";
import type { TextPresetId } from "./catalog";

export type TextMotionStyle = {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  filter: string;
  clipPath: string;
};

const ENTER_FRAMES = 22;
const EXIT_FRAMES = 18;

function clampEnter(frame: number): number {
  return Math.max(0, Math.min(frame, ENTER_FRAMES));
}

function ease(t: number): number {
  return Easing.out(Easing.cubic)(t);
}

export function computeTextEnter(
  preset: TextPresetId,
  frame: number,
  canvas: { width: number; height: number },
): TextMotionStyle {
  const t = ease(clampEnter(frame) / ENTER_FRAMES);
  const travel = Math.max(canvas.height * 0.06, 48);

  const base: TextMotionStyle = {
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scale: 1,
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0%)",
  };

  switch (preset) {
    case "static":
      return base;
    case "fade":
      return { ...base, opacity: t };
    case "blur-in":
      return { ...base, opacity: t, filter: `blur(${(1 - t) * 10}px)` };
    case "slide-up":
      return { ...base, opacity: t, translateY: (1 - t) * travel };
    case "slide-down":
      return { ...base, opacity: t, translateY: (1 - t) * -travel };
    case "slide-left":
      return { ...base, opacity: t, translateX: (1 - t) * travel };
    case "slide-right":
      return { ...base, opacity: t, translateX: (1 - t) * -travel };
    case "mask-up":
      return {
        ...base,
        clipPath: `inset(${(1 - t) * 100}% 0% 0% 0%)`,
      };
    case "mask-down":
      return {
        ...base,
        clipPath: `inset(0% 0% ${(1 - t) * 100}% 0%)`,
      };
    case "grow":
      return { ...base, opacity: t, scale: 0.82 + t * 0.18 };
    case "shrink":
      return { ...base, opacity: t, scale: 1.18 - t * 0.18 };
    default:
      return base;
  }
}

export function computeTextExit(
  localFrame: number,
  localDuration: number,
): Pick<TextMotionStyle, "opacity" | "translateY"> {
  const start = localDuration - EXIT_FRAMES;
  const opacity = interpolate(
    localFrame,
    [start, localDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const translateY = interpolate(
    localFrame,
    [start, localDuration],
    [0, 12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return { opacity, translateY };
}

export function computeSublineEnter(frame: number): number {
  return ease(Math.max(0, Math.min((frame - 8) / 18, 1)));
}
