import type { BackgroundStyleId } from "../art-direction/catalog";

export type SceneOrientation = "landscape" | "portrait" | "square";

export type SceneTypographyLayout = {
  readonly orientation: SceneOrientation;
  readonly textPlacement: "top" | "bottom";
  /** Horizontal padding from canvas edges */
  readonly paddingX: number;
  /** Distance of text block from top or bottom edge */
  readonly edgeInset: number;
  /** Max width of the text block (prevents edge overflow) */
  readonly maxTextWidth: number;
  readonly headlineSize: number;
  readonly sublineSize: number;
  readonly gapY: number;
  /** Fraction of canvas height reserved for the text band (UI must stay clear) */
  readonly textBandRatio: number;
  /** Max UI panel height ratio so it never sits under the text band */
  readonly maxUiHeightRatio: number;
  readonly maxUiWidthRatio: number;
  readonly headlineColor: string;
  readonly sublineColor: string;
  readonly textShadow: string;
  /** Soft scrim behind text for contrast over busy UI */
  readonly scrim: string | null;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function orientationOf(width: number, height: number): SceneOrientation {
  const ratio = width / height;
  if (ratio > 1.15) return "landscape";
  if (ratio < 0.88) return "portrait";
  return "square";
}

function isLightBackground(background: BackgroundStyleId): boolean {
  return background === "solid-white";
}

/**
 * Aspect-aware typography + safe zones so headlines stay readable
 * and never collide with the product UI across 9:16 / 16:9 / 1:1 / 4:5.
 */
export function computeSceneTypographyLayout(
  width: number,
  height: number,
  background: BackgroundStyleId = "solid-dark",
): SceneTypographyLayout {
  const orientation = orientationOf(width, height);
  const shortSide = Math.min(width, height);
  const light = isLightBackground(background);

  // Type scales from the short side so 16:9 doesn't blow up type, 9:16 stays readable
  const headlineSize = Math.round(clamp(shortSide * 0.045, 28, 56));
  const sublineSize = Math.round(clamp(shortSide * 0.024, 16, 28));
  const paddingX = Math.round(clamp(width * 0.06, 36, 96));
  const gapY = Math.round(clamp(shortSide * 0.014, 8, 18));

  // Landscape: text at bottom. Portrait/square: text at top (phone story convention)
  const textPlacement: "top" | "bottom" =
    orientation === "landscape" ? "bottom" : "top";

  const edgeInset =
    orientation === "landscape"
      ? Math.round(clamp(height * 0.055, 36, 72))
      : Math.round(clamp(height * 0.045, 40, 80));

  // Reserve a clear band so UI never sits under copy
  const textBandRatio =
    orientation === "landscape"
      ? 0.2
      : orientation === "square"
        ? 0.18
        : 0.16;

  const maxUiHeightRatio =
    orientation === "landscape"
      ? 0.62
      : orientation === "square"
        ? 0.58
        : 0.64;

  const maxUiWidthRatio =
    orientation === "landscape"
      ? 0.58
      : orientation === "square"
        ? 0.7
        : 0.78;

  const maxTextWidth = Math.round(
    clamp(width - paddingX * 2, shortSide * 0.7, width * 0.82),
  );

  return {
    orientation,
    textPlacement,
    paddingX,
    edgeInset,
    maxTextWidth,
    headlineSize,
    sublineSize,
    gapY,
    textBandRatio,
    maxUiHeightRatio,
    maxUiWidthRatio,
    headlineColor: light ? "#0a0a0b" : "#ffffff",
    sublineColor: light
      ? "rgba(24, 24, 27, 0.72)"
      : "rgba(255, 255, 255, 0.78)",
    textShadow: light
      ? "0 1px 2px rgba(255,255,255,0.6)"
      : "0 2px 16px rgba(0,0,0,0.65), 0 1px 3px rgba(0,0,0,0.4)",
    scrim: light
      ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 70%, transparent 100%)"
      : "linear-gradient(180deg, rgba(5,6,10,0.75) 0%, rgba(5,6,10,0.35) 65%, transparent 100%)",
  };
}
