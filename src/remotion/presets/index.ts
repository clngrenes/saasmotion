import type {
  CameraPresetName,
  PresetCameraConfigRegistry,
  PresetComputeFn,
  PresetFrameContext,
  PresetFrameOutput,
  PresetRegistry,
} from "../types/screenshot-video";
import { computeAppleStyle } from "./apple-style";
import { computeMinimalFlat } from "./minimal-flat";
import { computeZeliosStyle } from "./zelios-style";
import { computeLinearStyle } from "./linear-style";

import { computeCrashZoomStyle } from "./crash-zoom";

export const PRESET_REGISTRY: PresetRegistry = {
  "zelios-style": computeZeliosStyle,
  "apple-style": computeAppleStyle,
  "minimal-flat": computeMinimalFlat,
  "linear-style": computeLinearStyle,
  "crash-zoom": computeCrashZoomStyle,
};

/** Statische Kamera-Parameter (FOV) pro Preset, außerhalb der Frame-Kurven */
export const PRESET_CAMERA_CONFIG: PresetCameraConfigRegistry = {
  "zelios-style": { fov: 45 },
  "apple-style": { fov: 45 },
  "minimal-flat": { fov: 35 },
  "linear-style": { fov: 45 },
  "crash-zoom": { fov: 45 },
};

/** Liefert die reine Compute-Funktion für ein Preset */
export function getPresetCompute(name: CameraPresetName): PresetComputeFn {
  return PRESET_REGISTRY[name];
}

/** Berechnet Kamera- und Mesh-Transform für einen konkreten Frame */
export function computePresetFrame(
  presetName: CameraPresetName,
  ctx: PresetFrameContext,
): PresetFrameOutput {
  return PRESET_REGISTRY[presetName](ctx);
}

export { computeScreenInlay, DEVICE_FRAME, toMutableTuple } from "./shared";
