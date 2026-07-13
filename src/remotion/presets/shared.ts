import { Easing, interpolate } from "remotion";
import type {
  DeviceFrameSpec,
  ImageDimensions,
  ScreenFitMode,
  ScreenInlayLayout,
  Vec3,
} from "../types/screenshot-video";

/** Ursprung — für konstante (statische) Transform-Achsen */
export const ORIGIN: Vec3 = [0, 0, 0];

/** Wandelt einen readonly-Vec3 in ein mutables Tuple für R3F-Props um */
export function toMutableTuple(v: Vec3): [number, number, number] {
  return [v[0], v[1], v[2]];
}

/**
 * Standard-Device-Frame (Option B).
 *
 * Proportionen ~ 2.0 : 4.2 (≈ 9:19), nahe an modernen Smartphones.
 * Kamera-Distanzen der Presets sind auf diese Größe abgestimmt, sodass der
 * Rahmen in jedem Preset vollständig sichtbar bleibt.
 */
export const DEVICE_FRAME: DeviceFrameSpec = {
  frameWidth: 2.0,
  frameHeight: 4.2,
  bezel: 0.09,
  cornerRadius: 0.22,
};

type InterpolateEasing = (input: number) => number;

/**
 * Interpoliert einen kompletten Vec3 über denselben Frame-Bereich.
 * Wrappt Remotions `interpolate()` mit geklemmter Extrapolation, damit vor
 * `start` und nach `end` konstante Randwerte gelten (kein Überschwingen).
 */
export function interpolateVec3(
  frame: number,
  range: readonly [number, number],
  from: Vec3,
  to: Vec3,
  easing: InterpolateEasing = Easing.linear,
): Vec3 {
  const options = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing,
  };
  return [
    interpolate(frame, range, [from[0], to[0]], options),
    interpolate(frame, range, [from[1], to[1]], options),
    interpolate(frame, range, [from[2], to[2]], options),
  ];
}

/**
 * Berechnet Größe und UV-Mapping der Screenshot-Plane innerhalb des Displays.
 *
 * - `cover` (Default): Plane füllt das gesamte Display; überstehende Bereiche
 *   des Bildes werden mittig via UV-Repeat/Offset zugeschnitten.
 * - `contain`: Plane wird auf das Bild-Seitenverhältnis verkleinert; der dunkle
 *   Gerätekörper bildet die Letterbox-Ränder.
 */
export function computeScreenInlay(
  image: ImageDimensions,
  frame: DeviceFrameSpec,
  mode: ScreenFitMode = "cover",
): ScreenInlayLayout {
  const innerWidth = frame.frameWidth - 2 * frame.bezel;
  const innerHeight = frame.frameHeight - 2 * frame.bezel;

  const safeImageWidth = Math.max(image.width, 1);
  const safeImageHeight = Math.max(image.height, 1);
  const imageAspect = safeImageWidth / safeImageHeight;
  const innerAspect = innerWidth / innerHeight;

  if (mode === "cover") {
    let repeatX = 1;
    let repeatY = 1;
    if (imageAspect > innerAspect) {
      repeatX = innerAspect / imageAspect;
    } else {
      repeatY = imageAspect / innerAspect;
    }
    return {
      width: innerWidth,
      height: innerHeight,
      offsetX: 0,
      offsetY: 0,
      uvScale: [repeatX, repeatY],
      uvOffset: [(1 - repeatX) / 2, (1 - repeatY) / 2],
    };
  }

  let width = innerWidth;
  let height = innerHeight;
  if (imageAspect > innerAspect) {
    height = innerWidth / imageAspect;
  } else {
    width = innerHeight * imageAspect;
  }
  return {
    width,
    height,
    offsetX: 0,
    offsetY: 0,
    uvScale: [1, 1],
    uvOffset: [0, 0],
  };
}
