import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { INTRO_DURATION_FRAMES } from "../constants/media";

interface ProductIntroProps {
  readonly productName: string;
  readonly tagline: string;
  readonly logoUrl?: string;
}

export const ProductIntro: React.FC<ProductIntroProps> = ({
  productName,
  tagline,
  logoUrl,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 12, INTRO_DURATION_FRAMES - 14, INTRO_DURATION_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = interpolate(frame, [0, 20], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!productName) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <div style={{ transform: `scale(${scale})`, textAlign: "center", padding: 48 }}>
        {logoUrl && (
          <Img
            src={logoUrl}
            style={{
              width: 96,
              height: 96,
              objectFit: "contain",
              margin: "0 auto 28px",
              display: "block",
            }}
          />
        )}
        <p
          style={{
            margin: 0,
            color: "rgba(148, 163, 184, 0.9)",
            fontSize: 26,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Introducing
        </p>
        <h1
          style={{
            margin: "12px 0 0",
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          {productName}
        </h1>
        {tagline && (
          <p
            style={{
              margin: "20px 0 0",
              color: "rgba(226, 232, 240, 0.75)",
              fontSize: 30,
              fontWeight: 400,
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
