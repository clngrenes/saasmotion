import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { computeLogoIntroStyle } from "../motion-skills/logo-intro";
import type { LogoIntroBackdropId, LogoIntroMotionId } from "../motion-skills/ids";
import {
  DEFAULT_LOGO_INTRO_BACKDROP,
  DEFAULT_LOGO_INTRO_MOTION,
} from "../motion-skills/ids";
import {
  DEFAULT_SVG_ACCENT,
  DEFAULT_SVG_MOTION,
  type SvgAccentId,
  type SvgMotionId,
} from "../motion-skills/svg/ids";
import { SvgMotionLayer } from "../motion-skills/svg/SvgMotionLayer";

interface ProductIntroProps {
  readonly logoUrl?: string;
  readonly logoIntroMotion?: LogoIntroMotionId;
  readonly logoIntroBackdrop?: LogoIntroBackdropId;
  readonly svgMotion?: SvgMotionId;
  readonly svgAccent?: SvgAccentId;
}

const BACKDROP_COLOR: Record<LogoIntroBackdropId, string> = {
  white: "#ffffff",
  dark: "#05060a",
};

export const ProductIntro: React.FC<ProductIntroProps> = ({
  logoUrl,
  logoIntroMotion = DEFAULT_LOGO_INTRO_MOTION,
  logoIntroBackdrop = DEFAULT_LOGO_INTRO_BACKDROP,
  svgMotion = DEFAULT_SVG_MOTION,
  svgAccent = DEFAULT_SVG_ACCENT,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  if (!logoUrl) {
    return null;
  }

  const style = computeLogoIntroStyle(frame, logoIntroMotion);
  const logoSize = Math.round(Math.min(width * 0.22, 280));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BACKDROP_COLOR[logoIntroBackdrop],
        justifyContent: "center",
        alignItems: "center",
        opacity: style.screenOpacity,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <SvgMotionLayer
        motion={svgMotion}
        accent={svgAccent}
        backdrop={logoIntroBackdrop}
        masterOpacity={style.screenOpacity}
      />
      <div
        style={{
          clipPath: style.clipPath,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Img
          src={logoUrl}
          style={{
            width: logoSize,
            height: logoSize,
            objectFit: "contain",
            opacity: style.opacity,
            filter: style.blur > 0 ? `blur(${style.blur}px)` : undefined,
            transform: `translate(${style.translateX}px, ${style.translateY}px) scale(${style.scale})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
