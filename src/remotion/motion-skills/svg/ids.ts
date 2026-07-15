/** SVG vector motion skills — Jitter-style shapes, paths, strokes (AI picks) */
export const SVG_MOTION_IDS = [
  "none",
  "ambient-blobs",
  "stroke-frame",
  "radial-burst",
  "orbit-dots",
  "shape-pop",
  "wave-underline",
  "mesh-glow",
] as const;

export type SvgMotionId = (typeof SVG_MOTION_IDS)[number];

export const DEFAULT_SVG_MOTION: SvgMotionId = "ambient-blobs";

/** Accent palette inferred from product UI colors */
export const SVG_ACCENT_IDS = [
  "violet",
  "cyan",
  "emerald",
  "rose",
  "amber",
  "neutral",
] as const;

export type SvgAccentId = (typeof SVG_ACCENT_IDS)[number];

export const DEFAULT_SVG_ACCENT: SvgAccentId = "violet";

export const SVG_MOTION_SKILL_GUIDE = `
SVG MOTION (vector layers — Jitter-style shapes & path animation):
Use when logo is uploaded or product feels design-forward. Pair with logoIntroMotion.

Skills:
- none: no SVG layer — minimal / busy UI already
- ambient-blobs: soft gradient orbs float behind logo — Linear/Framer launch style
- stroke-frame: rounded rect path draws around logo (stroke reveal via @remotion/paths)
- radial-burst: thin lines burst from center then fade — energetic AI/startup
- orbit-dots: small dots orbit the logo — playful SaaS / mobile
- shape-pop: geometric squares pop in staggered — bold editorial
- wave-underline: curved path draws under logo — friendly consumer apps
- mesh-glow: layered radial gradients pulse — futuristic / AI products

Accent (match screenshot UI colors):
- violet / cyan / emerald / rose / amber / neutral
Pick accent from dominant brand color in screenshots.
`;

export const SVG_ACCENT_COLORS: Record<
  SvgAccentId,
  { readonly primary: string; readonly secondary: string; readonly glow: string }
> = {
  violet: { primary: "#8b5cf6", secondary: "#c4b5fd", glow: "rgba(139,92,246,0.35)" },
  cyan: { primary: "#06b6d4", secondary: "#67e8f9", glow: "rgba(6,182,212,0.32)" },
  emerald: { primary: "#10b981", secondary: "#6ee7b7", glow: "rgba(16,185,129,0.3)" },
  rose: { primary: "#f43f5e", secondary: "#fda4af", glow: "rgba(244,63,94,0.28)" },
  amber: { primary: "#f59e0b", secondary: "#fcd34d", glow: "rgba(245,158,11,0.28)" },
  neutral: { primary: "#64748b", secondary: "#94a3b8", glow: "rgba(100,116,139,0.25)" },
};
