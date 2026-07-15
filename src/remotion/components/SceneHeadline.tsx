import React from "react";
import { useVideoConfig } from "remotion";
import { SAAS_FONT_FAMILY } from "../constants/typography";

interface SceneHeadlineProps {
  readonly headline: string;
  readonly subline: string;
  readonly localFrame: number;
  readonly localDuration: number;
  readonly textPreset?: string;
}

export const SceneHeadline: React.FC<SceneHeadlineProps> = ({
  headline,
  subline,
}) => {
  const { width, height } = useVideoConfig();
  const isLandscape = width > height;

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
          ? { bottom: Math.round(height * 0.06), left: 0, right: 0 }
          : { top: Math.round(height * 0.04), left: 0, right: 0 }),
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
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            fontFamily: SAAS_FONT_FAMILY,
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
            letterSpacing: "-0.01em",
            lineHeight: 1.35,
            fontFamily: SAAS_FONT_FAMILY,
          }}
        >
          {subline}
        </p>
      )}
    </div>
  );
};
