import { Easing } from "remotion";
import type { PresetComputeFn, Vec3 } from "../types/screenshot-video";
import { interpolateVec3, ORIGIN } from "./shared";

/** Sanfte, gleichmäßige Kurve — kein harter Start/Stop */
const EASE = Easing.inOut(Easing.cubic);

const CAMERA_POSITION: Vec3 = [0, 0.25, 7.0];

/**
 * Isometrischer Start (seitlich geneigt) → sanfter Übergang zu leicht
 * top-down — ähnlich wie bei Premium Product-Demos.
 */
const MESH_START_ROTATION: Vec3 = [0.42, -0.38, 0.01];
const MESH_END_ROTATION: Vec3 = [0.16, 0.3, -0.01];

/**
 * "Apple-Style" / Orbit — das Interface dreht sich smooth durch einen
 * isometrischen Bogen (X + Y), Kamera bleibt leicht erhöht und statisch.
 */
export const computeAppleStyle: PresetComputeFn = ({
  frame,
  durationInFrames,
}) => {
  const range: readonly [number, number] = [0, durationInFrames];

  return {
    camera: {
      position: CAMERA_POSITION,
      rotation: ORIGIN,
    },
    mesh: {
      position: ORIGIN,
      rotation: interpolateVec3(
        frame,
        range,
        MESH_START_ROTATION,
        MESH_END_ROTATION,
        EASE,
      ),
    },
  };
};
