import { Easing } from "remotion";
import type { PresetComputeFn, Vec3 } from "../types/screenshot-video";
import { interpolateVec3, ORIGIN } from "./shared";

/** Sanfte SaaS-Demo-Kurve (ease-in-out, leicht betont am Ende) */
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

const CAMERA_START_POSITION: Vec3 = [0, 0.3, 9.0];
const CAMERA_END_POSITION: Vec3 = [0, 0, 5.8];
const CAMERA_START_ROTATION: Vec3 = [0, -0.12, 0];
const CAMERA_END_ROTATION: Vec3 = [0, 0.08, 0];

/** Konstante leichte Neigung des Screens für einen "floating" Look */
const MESH_ROTATION: Vec3 = [0, -0.04, 0];

/**
 * "Zelios-Style" — langsamer Dolly-in auf der Z-Achse, kombiniert mit einem
 * dezenten Y-Schwenk der Kamera. Das Mesh bleibt statisch.
 */
export const computeZeliosStyle: PresetComputeFn = ({
  frame,
  durationInFrames,
}) => {
  const range: readonly [number, number] = [0, durationInFrames];
  return {
    camera: {
      position: interpolateVec3(
        frame,
        range,
        CAMERA_START_POSITION,
        CAMERA_END_POSITION,
        EASE,
      ),
      rotation: interpolateVec3(
        frame,
        range,
        CAMERA_START_ROTATION,
        CAMERA_END_ROTATION,
        EASE,
      ),
    },
    mesh: {
      position: ORIGIN,
      rotation: MESH_ROTATION,
    },
  };
};
