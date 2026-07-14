import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface SceneHeadlineProps {
  readonly headline: string;
  readonly subline: string;
  readonly localFrame: number;
  readonly localDuration: number;
}

export const SceneHeadline: React.FC<SceneHeadlineProps> = ({
  headline,
  subline,
  localFrame,
  localDuration,
}) => {
  const { width, height } = useVideoConfig();
  const isLandscape = width > height;

  const headlineOpacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(localFrame, [0, 18], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sublineOpacity = interpolate(localFrame, [14, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const containerOpacity = interpolate(
    localFrame,
    [localDuration - 20, localDuration - 6],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (!headline && !subline) {
    return null;
  }

  const headlineSize = Math.round(width * 0.048);
  const sublineSize = Math.round(width * 0.026);
  const paddingX = Math.round(width * 0.05);

  return (
    <div
      style={{
        position: "absolute",
        ...(isLandscape
          ? { bottom: Math.round(height * 0.08), left: 0, right: 0 }
          : { top: Math.round(height * 0.06), left: 0, right: 0 }),
        padding: `0 ${paddingX}px`,
        textAlign: "center",
        opacity: containerOpacity,
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
            transform: `translateY(${headlineY}px)`,
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
            opacity: sublineOpacity,
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
