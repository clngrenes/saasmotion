import { evolvePath } from "@remotion/paths";
import React, { useMemo } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  SVG_ACCENT_COLORS,
  type SvgAccentId,
  type SvgMotionId,
} from "./ids";
import type { LogoIntroBackdropId } from "../ids";

type SvgMotionLayerProps = {
  readonly motion: SvgMotionId;
  readonly accent: SvgAccentId;
  readonly backdrop: LogoIntroBackdropId;
  readonly masterOpacity?: number;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export const SvgMotionLayer: React.FC<SvgMotionLayerProps> = ({
  motion,
  accent,
  backdrop,
  masterOpacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const colors = SVG_ACCENT_COLORS[accent];
  const isDark = backdrop === "dark";

  const fadeIn = clamp01(frame / 18);
  const layerOpacity = fadeIn * masterOpacity * (isDark ? 0.95 : 0.85);

  const cx = width / 2;
  const cy = height / 2;
  const logoRadius = Math.min(width, height) * 0.14;

  const framePath = useMemo(() => {
    const w = logoRadius * 2.4;
    const h = logoRadius * 2.4;
    const x = cx - w / 2;
    const y = cy - h / 2;
    const r = 28;
    return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
  }, [cx, cy, logoRadius]);

  const wavePath = useMemo(() => {
    const y = cy + logoRadius * 1.35;
    return `M ${cx - logoRadius * 1.6} ${y} Q ${cx - logoRadius * 0.5} ${y - 28} ${cx} ${y} T ${cx + logoRadius * 1.6} ${y}`;
  }, [cx, cy, logoRadius]);

  if (motion === "none") {
    return null;
  }

  const strokeProgress = clamp01(
    interpolate(frame, [8, 36], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );

  const { strokeDasharray, strokeDashoffset } = evolvePath(strokeProgress, framePath);
  const waveEvolve = evolvePath(
    clamp01(interpolate(frame, [14, 40], [0, 1], { extrapolateRight: "clamp" })),
    wavePath,
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        opacity: layerOpacity,
        pointerEvents: "none",
      }}
    >
      <defs>
        <radialGradient id="svg-blob-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity={isDark ? 0.45 : 0.28} />
          <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="svg-blob-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity={isDark ? 0.35 : 0.22} />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity={0} />
        </radialGradient>
        <filter id="svg-blur">
          <feGaussianBlur stdDeviation="48" />
        </filter>
      </defs>

      {(motion === "ambient-blobs" || motion === "mesh-glow") && (
        <>
          <ellipse
            cx={cx + Math.sin(frame / 40) * 40}
            cy={cy + Math.cos(frame / 35) * 30}
            rx={logoRadius * 2.2}
            ry={logoRadius * 1.8}
            fill="url(#svg-blob-a)"
            filter="url(#svg-blur)"
          />
          <ellipse
            cx={cx + Math.cos(frame / 45) * 60}
            cy={cy + Math.sin(frame / 38) * 45}
            rx={logoRadius * 1.6}
            ry={logoRadius * 2}
            fill="url(#svg-blob-b)"
            filter="url(#svg-blur)"
          />
          {motion === "mesh-glow" && (
            <circle
              cx={cx}
              cy={cy}
              r={logoRadius * 1.5 + Math.sin(frame / 20) * 8}
              fill={colors.glow}
              filter="url(#svg-blur)"
            />
          )}
        </>
      )}

      {motion === "stroke-frame" && (
        <path
          d={framePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          opacity={0.85}
        />
      )}

      {motion === "radial-burst" &&
        Array.from({ length: 12 }).map((_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          const x2 = cx + Math.cos(angle) * logoRadius * 2.2;
          const y2 = cy + Math.sin(angle) * logoRadius * 2.2;
          const linePath = `M ${cx} ${cy} L ${x2} ${y2}`;
          const lineProgress = clamp01(
            strokeProgress - index * 0.04,
          );
          const evolved = evolvePath(lineProgress, linePath);
          return (
            <path
              key={index}
              d={linePath}
              stroke={colors.primary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={evolved.strokeDasharray}
              strokeDashoffset={evolved.strokeDashoffset}
              opacity={0.55}
            />
          );
        })}

      {motion === "orbit-dots" &&
        Array.from({ length: 5 }).map((_, index) => {
          const angle = frame / 24 + (index / 5) * Math.PI * 2;
          const orbitR = logoRadius * 1.55;
          const dotX = cx + Math.cos(angle) * orbitR;
          const dotY = cy + Math.sin(angle) * orbitR;
          const dotOpacity = clamp01(interpolate(frame, [index * 4, index * 4 + 12], [0, 1]));
          return (
            <circle
              key={index}
              cx={dotX}
              cy={dotY}
              r={4 + index * 0.5}
              fill={index % 2 === 0 ? colors.primary : colors.secondary}
              opacity={dotOpacity * 0.9}
            />
          );
        })}

      {motion === "shape-pop" &&
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
          [-1, 0],
          [1, 0],
        ].map(([dx, dy], index) => {
          const pop = clamp01(
            interpolate(frame, [6 + index * 3, 18 + index * 3], [0, 1], {
              easing: Easing.out(Easing.back(1.4)),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          );
          const size = 10 + pop * 14;
          return (
            <rect
              key={index}
              x={cx + dx * logoRadius * 1.7 - size / 2}
              y={cy + dy * logoRadius * 1.2 - size / 2}
              width={size}
              height={size}
              rx={3}
              fill={colors.primary}
              opacity={0.35 * pop}
              transform={`rotate(${pop * 18} ${cx + dx * logoRadius * 1.7} ${cy + dy * logoRadius * 1.2})`}
            />
          );
        })}

      {motion === "wave-underline" && (
        <path
          d={wavePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={waveEvolve.strokeDasharray}
          strokeDashoffset={waveEvolve.strokeDashoffset}
          opacity={0.75}
        />
      )}
    </svg>
  );
};
