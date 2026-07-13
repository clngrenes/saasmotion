/** Preset-IDs — kebab-case, stabil für API/DB/Lambda-Props */
export const CAMERA_PRESET_NAMES = [
  "zelios-style",
  "apple-style",
  "minimal-flat",
] as const;

export type CameraPresetName = (typeof CAMERA_PRESET_NAMES)[number];

/** 3D-Vektor als Position/Euler-Tuple (Radian für Rotation) */
export type Vec3 = readonly [number, number, number];

/** Frame-synchrone Transform für Kamera oder Mesh */
export interface FrameTransform {
  readonly position: Vec3;
  readonly rotation: Vec3;
}

/** Input-Kontext, den jede Preset-Funktion pro Frame erhält */
export interface PresetFrameContext {
  readonly frame: number;
  readonly durationInFrames: number;
  readonly fps: number;
}

/**
 * Output pro Frame: getrennt für Kamera und Mesh,
 * weil Apple-Style die Kamera statisch hält und nur das Mesh rotiert.
 */
export interface PresetFrameOutput {
  readonly camera: FrameTransform;
  readonly mesh: FrameTransform;
}

/** Signatur aller Preset-Funktionen — pure, testbar, kein React */
export type PresetComputeFn = (ctx: PresetFrameContext) => PresetFrameOutput;

export type VideoScene = {
  readonly screenshotUrl: string;
  readonly headline: string;
  readonly subline: string;
};

/**
 * Remotion Composition Props (öffentliche API).
 *
 * Als `type` (nicht `interface`) definiert, weil Remotions `Composition`-Generic
 * `Props extends Record<string, unknown>` verlangt — dafür wird die implizite
 * Index-Signatur eines Type-Alias benötigt.
 */
export type ScreenshotVideoProps = {
  readonly scenes: readonly VideoScene[];
  readonly productName: string;
  readonly tagline: string;
  readonly presetName: CameraPresetName;
  readonly durationInFrames: number;
  readonly backgroundMusicUrl: string;
  readonly transitionSfxUrl: string;
  readonly enableAudio: boolean;
};

/** Device-Frame Geometrie-Konstanten (Option B Default) */
export interface DeviceFrameSpec {
  /** Äußere Breite des Geräts in World-Units */
  readonly frameWidth: number;
  /** Äußere Höhe des Geräts in World-Units */
  readonly frameHeight: number;
  /** Bezel/Rand zwischen Gehäusekante und Display in World-Units */
  readonly bezel: number;
  /** Eckenradius des Gehäuses in World-Units */
  readonly cornerRadius: number;
}

/** Registry: Preset-Name → Compute-Funktion */
export type PresetRegistry = Record<CameraPresetName, PresetComputeFn>;

/** Statische, nicht-animierte Kamera-Parameter pro Preset */
export interface PresetCameraConfig {
  /** Vertikaler Sichtfeld-Winkel in Grad */
  readonly fov: number;
}

/** Registry: Preset-Name → statische Kamera-Konfiguration */
export type PresetCameraConfigRegistry = Record<
  CameraPresetName,
  PresetCameraConfig
>;

/** Natürliche Pixel-Dimensionen eines geladenen Screenshots */
export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

/** Fit-Modus des Screenshots innerhalb des Device-Displays */
export type ScreenFitMode = "cover" | "contain";

/**
 * Berechnetes Layout der Screen-Plane innerhalb des Device-Frames.
 *
 * - `width`/`height`: World-Unit-Größe der tatsächlich gezeichneten Plane.
 * - `offsetX`/`offsetY`: Verschiebung der Plane relativ zur Frame-Mitte.
 * - `uvScale`/`uvOffset`: Textur-Repeat/Offset für Center-Crop (Cover).
 */
export interface ScreenInlayLayout {
  readonly width: number;
  readonly height: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly uvScale: readonly [number, number];
  readonly uvOffset: readonly [number, number];
}
