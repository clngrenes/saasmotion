import { Easing, interpolate } from "remotion";
import type { PresetComputeFn, Vec3 } from "../types/screenshot-video";
import { ORIGIN } from "./shared";

/** Gleichmäßige Rotation ohne harte Kanten */
const EASE = Easing.inOut(Easing.cubic);

const CAMERA_POSITION: Vec3 = [0, 0, 6.5];

/** ~63° Gesamtdrehung um die Y-Achse */
const MAX_Y_ROTATION = Math.PI * 0.35;
/** Subtiler X-Tilt für zusätzliche Tiefenwirkung */
const TILT_X_START = -0.05;
const TILT_X_END = 0.05;

/**
 * "Apple-Style" — statische Kamera; der Screen dreht sich selbst um seine
 * Y-Achse und kippt dabei minimal auf der X-Achse.
 */
export const computeAppleStyle: PresetComputeFn = ({
  frame,
  durationInFrames,
}) => {
  const range: readonly [number, number] = [0, durationInFrames];
  const options = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing: EASE,
  };
  const rotationY = interpolate(frame, range, [0, MAX_Y_ROTATION], options);
  const rotationX = interpolate(frame, range, [TILT_X_START, TILT_X_END], options);

  return {
    camera: {
      position: CAMERA_POSITION,
      rotation: ORIGIN,
    },
    mesh: {
      position: ORIGIN,
      rotation: [rotationX, rotationY, 0],
    },
  };
};
