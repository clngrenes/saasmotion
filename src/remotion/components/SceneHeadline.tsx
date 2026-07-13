import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

function typewriterLength(
  frame: number,
  text: string,
  startFrame: number,
  charsPerFrame = 0.55,
): number {
  const elapsed = Math.max(0, frame - startFrame);
  return Math.min(text.length, Math.floor(elapsed * charsPerFrame));
}

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
  const headlineChars = typewriterLength(localFrame, headline, 8);
  const visibleHeadline = headline.slice(0, headlineChars);
  const headlineDone = headlineChars >= headline.length;

  const sublineOpacity = interpolate(
    localFrame,
    [headline.length * 2 + 12, headline.length * 2 + 28],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const containerOpacity = interpolate(
    localFrame,
    [localDuration - 18, localDuration - 4],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (!headline && !subline) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        padding: "0 56px",
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
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {visibleHeadline}
          {!headlineDone && (
            <span style={{ opacity: interpolate(localFrame % 16, [0, 8, 16], [1, 0, 1]) }}>
              |
            </span>
          )}
        </h2>
      )}
      {subline && headlineDone && (
        <p
          style={{
            margin: "16px 0 0",
            color: "rgba(226, 232, 240, 0.82)",
            fontSize: 28,
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
