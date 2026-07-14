import React from "react";
import { useVideoConfig } from "remotion";
import type { TextPresetId } from "../text-presets/catalog";
import {
  computeSublineEnter,
  computeTextEnter,
  computeTextExit,
} from "../text-presets/compute";

interface SceneHeadlineProps {
  readonly headline: string;
  readonly subline: string;
  readonly localFrame: number;
  readonly localDuration: number;
  readonly textPreset: TextPresetId;
}

export const SceneHeadline: React.FC<SceneHeadlineProps> = ({
  headline,
  subline,
  localFrame,
  localDuration,
  textPreset,
}) => {
  const { width, height } = useVideoConfig();
  const isLandscape = width > height;

  const enter = computeTextEnter(textPreset, localFrame, { width, height });
  const exit = computeTextExit(localFrame, localDuration);
  const sublineOpacity = computeSublineEnter(localFrame);

  if (!headline && !subline) {
    return null;
  }

  const headlineSize = Math.round(width * 0.048);
  const sublineSize = Math.round(width * 0.026);
  const paddingX = Math.round(width * 0.05);

  const headlineOpacity = enter.opacity * exit.opacity;
  const headlineTransform = [
    `translateX(${enter.translateX}px)`,
    `translateY(${enter.translateY + exit.translateY}px)`,
    `scale(${enter.scale})`,
  ].join(" ");

  return (
    <div
      style={{
        position: "absolute",
        ...(isLandscape
          ? { bottom: Math.round(height * 0.08), left: 0, right: 0 }
          : { top: Math.round(height * 0.06), left: 0, right: 0 }),
        padding: `0 ${paddingX}px`,
        textAlign: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {headline && (
        <h2
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: headlineSize,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            opacity: headlineOpacity,
            transform: headlineTransform,
            filter: enter.filter,
            clipPath: enter.clipPath,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {headline}
        </h2>
      )}
      {subline && (
        <p
          style={{
            margin: `${Math.round(height * 0.012)}px 0 0`,
            color: "rgba(226, 232, 240, 0.82)",
            fontSize: sublineSize,
            fontWeight: 400,
            lineHeight: 1.35,
            opacity: sublineOpacity * exit.opacity,
            transform: `translateY(${exit.translateY}px)`,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {subline}
        </p>
      )}
    </div>
  );
};
