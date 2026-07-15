import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { INTRO_DURATION_FRAMES } from "../constants/media";

interface ProductIntroProps {
  readonly logoUrl?: string;
}

const ENTER_END = 22;
const HOLD_END = INTRO_DURATION_FRAMES - 16;

export const ProductIntro: React.FC<ProductIntroProps> = ({ logoUrl }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  if (!logoUrl) {
    return null;
  }

  const blurIn = interpolate(frame, [0, ENTER_END], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const blurOut = interpolate(frame, [HOLD_END, INTRO_DURATION_FRAMES], [0, 18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const blur = frame < HOLD_END ? blurIn : blurOut;

  const logoOpacity = interpolate(
    frame,
    [0, ENTER_END, HOLD_END, INTRO_DURATION_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = interpolate(frame, [0, ENTER_END], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const screenOpacity = interpolate(
    frame,
    [HOLD_END - 4, INTRO_DURATION_FRAMES],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const logoSize = Math.round(Math.min(width * 0.22, 280));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        opacity: screenOpacity,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <Img
        src={logoUrl}
        style={{
          width: logoSize,
          height: logoSize,
          objectFit: "contain",
          opacity: logoOpacity,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
