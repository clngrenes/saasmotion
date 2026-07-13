import { Easing, interpolate } from "remotion";
import type { PresetComputeFn, Vec3 } from "../types/screenshot-video";
import { ORIGIN } from "./shared";

/** Abbremsende Kurve für einen sauberen Slide-Stop */
const EASE = Easing.out(Easing.cubic);

/** Weit entfernte Kamera + enger FOV ergibt einen flachen 2.5D-Look */
const CAMERA_POSITION: Vec3 = [0, 0, 10];

const SLIDE_START_Y = -4.0;
const SLIDE_END_Y = 0;
/** Der Slide ist nach 70 % der Dauer abgeschlossen; danach steht das Mesh */
const SLIDE_PORTION = 0.7;

/**
 * "Minimal-Flat" — einfacher Slide-in von unten ohne jegliche 3D-Rotation.
 */
export const computeMinimalFlat: PresetComputeFn = ({
  frame,
  durationInFrames,
}) => {
  const slideEnd = Math.max(1, Math.round(durationInFrames * SLIDE_PORTION));
  const positionY = interpolate(
    frame,
    [0, slideEnd],
    [SLIDE_START_Y, SLIDE_END_Y],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    },
  );

  return {
    camera: {
      position: CAMERA_POSITION,
      rotation: ORIGIN,
    },
    mesh: {
      position: [0, positionY, 0],
      rotation: ORIGIN,
    },
  };
};
