import type { TextPresetId } from "../text-presets/catalog";
import { DEFAULT_TEXT_PRESET } from "../text-presets/catalog";
import type { CameraPresetName, FrameStyleId } from "../types/screenshot-video";
import {
  DEFAULT_SCENE_TRANSITION,
  SCENE_TRANSITION_SKILL_GUIDE,
  type SceneTransitionId,
} from "../transitions/ids";
import {
  DEFAULT_LOGO_INTRO_BACKDROP,
  DEFAULT_LOGO_INTRO_MOTION,
  LOGO_INTRO_SKILL_GUIDE,
  MOTION_DIRECTOR_SKILL_GUIDE,
  type LogoIntroBackdropId,
  type LogoIntroMotionId,
} from "../motion-skills/ids";
import {
  DEFAULT_SVG_ACCENT,
  DEFAULT_SVG_MOTION,
  SVG_MOTION_SKILL_GUIDE,
  type SvgAccentId,
  type SvgMotionId,
} from "../motion-skills/svg/ids";

export type { SceneTransitionId, LogoIntroMotionId, LogoIntroBackdropId, SvgMotionId, SvgAccentId };
export {
  SCENE_TRANSITION_SKILL_GUIDE,
  LOGO_INTRO_SKILL_GUIDE,
  MOTION_DIRECTOR_SKILL_GUIDE,
  SVG_MOTION_SKILL_GUIDE,
};

/** Hintergrund-Stile, die die KI wählen kann */
export const BACKGROUND_STYLE_IDS = [
  "dark-gradient",
  "cinematic-space",
  "solid-white",
  "solid-dark",
] as const;

export type BackgroundStyleId = (typeof BACKGROUND_STYLE_IDS)[number];

export const CORNER_RADIUS_IDS = ["low", "medium", "high"] as const;
export type CornerRadiusId = (typeof CORNER_RADIUS_IDS)[number];

export const INTRO_MOTION_IDS = ["scale-in", "slide-up", "fade", "none"] as const;
export type IntroMotionId = (typeof INTRO_MOTION_IDS)[number];

/** Visuelle Panel-Parameter — aus KI-Art-Direction abgeleitet */
export type PanelVisualStyle = {
  readonly cornerRadius: CornerRadiusId;
  readonly glass: boolean;
  readonly dropShadow: boolean;
  readonly stroke: boolean;
  readonly panelOpacity: number;
  readonly backgroundBlur: boolean;
};

/** Vollständige Art-Direction — die KI wählt aus dem Skill-Katalog */
export const VIDEO_ASPECT_RATIO_IDS = [
  "9:16",
  "16:9",
  "1:1",
  "4:5",
] as const;

export type VideoAspectRatioId = (typeof VIDEO_ASPECT_RATIO_IDS)[number];

export const VIDEO_DURATION_FRAME_OPTIONS = [900, 1800, 2700, 3600] as const;
export type VideoDurationFrames = (typeof VIDEO_DURATION_FRAME_OPTIONS)[number];

/** Gemini response_schema requires string enum values — use in AI schema only */
export const VIDEO_DURATION_FRAME_STRINGS = ["900", "1800", "2700", "3600"] as const;
export type VideoDurationFrameString = (typeof VIDEO_DURATION_FRAME_STRINGS)[number];

export function parseDurationInFrames(
  value: string | number,
  sceneCount = 1,
): VideoDurationFrames {
  const frames = typeof value === "number" ? value : Number(value);
  if (VIDEO_DURATION_FRAME_OPTIONS.includes(frames as VideoDurationFrames)) {
    return frames as VideoDurationFrames;
  }
  return inferDurationFromSceneCount(sceneCount);
}

export type ArtDirection = {
  readonly reasoning: string;
  readonly cameraPreset: CameraPresetName;
  readonly frameStyle: FrameStyleId;
  readonly textPreset: TextPresetId;
  readonly aspectRatio: VideoAspectRatioId;
  readonly durationInFrames: VideoDurationFrames;
  readonly background: BackgroundStyleId;
  readonly effects: {
    readonly glass: boolean;
    readonly dropShadow: boolean;
    readonly backgroundBlur: boolean;
  };
  readonly style: {
    readonly cornerRadius: CornerRadiusId;
    readonly stroke: boolean;
    readonly panelOpacity: number;
  };
  readonly introMotion: IntroMotionId;
  readonly sceneTransition: SceneTransitionId;
  readonly logoIntroMotion: LogoIntroMotionId;
  readonly logoIntroBackdrop: LogoIntroBackdropId;
  readonly svgMotion: SvgMotionId;
  readonly svgAccent: SvgAccentId;
};

export const DEFAULT_ART_DIRECTION: ArtDirection = {
  reasoning: "Default cinematic SaaS look",
  cameraPreset: "apple-style",
  frameStyle: "window",
  textPreset: DEFAULT_TEXT_PRESET,
  aspectRatio: "16:9",
  durationInFrames: 900,
  background: "dark-gradient",
  effects: {
    glass: false,
    dropShadow: true,
    backgroundBlur: false,
  },
  style: {
    cornerRadius: "medium",
    stroke: false,
    panelOpacity: 1,
  },
  introMotion: "scale-in",
  sceneTransition: DEFAULT_SCENE_TRANSITION,
  logoIntroMotion: DEFAULT_LOGO_INTRO_MOTION,
  logoIntroBackdrop: DEFAULT_LOGO_INTRO_BACKDROP,
  svgMotion: DEFAULT_SVG_MOTION,
  svgAccent: DEFAULT_SVG_ACCENT,
};

export const CORNER_RADIUS_UNITS: Record<CornerRadiusId, number> = {
  low: 0.08,
  medium: 0.15,
  high: 0.28,
};

export const BACKGROUND_CSS: Record<BackgroundStyleId, string> = {
  "dark-gradient":
    "radial-gradient(120% 120% at 50% 20%, #1b2233 0%, #0a0d15 58%, #05060a 100%)",
  "cinematic-space":
    "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1f3a 0%, #0a0d18 45%, #020308 100%)",
  "solid-white": "#ffffff",
  "solid-dark": "#05060a",
};

/** Skill-Beschreibung für das KI-Prompt */
export const ART_DIRECTION_SKILL_GUIDE = `
You are also the motion art director. Pick the best visual skills for this product.

${MOTION_DIRECTOR_SKILL_GUIDE}

TRANSFORM (camera / motion):
- linear-style (Whip Zoom): fast snap zoom directly into the highlighted element, extreme easing — ALWAYS USE THIS for desktop or high-end products. It is the absolute best.
- crash-zoom: hyper-aggressive, very fast zoom in. Best for CONVERSION funnel stage videos to emphasize speed.
- zelios-style (Dolly): slow push-in, subtle Y swing — enterprise, calm, trustworthy
- apple-style (3D Orbit): smooth isometric X+Y rotation — premium product demos (OpenAI style)
- minimal-flat (Slide): flat slide-up, no rotation — playful, simple, mobile-first apps

FRAME:
- window: desktop/web UI floating panel — SaaS dashboards, web apps (default for desktop screenshots)
- phone: device frame — mobile apps, iOS/Android screenshots

TEXT ANIMATION (Inter typography — always animate, never static):
- kinetic-words: default for premium SaaS — words stagger in with spring physics (Linear style)
- kinetic-pills / kinetic-chat: high-end editorial motion for launches and conversational products
- kinetic-timeline: use '|' in subline for 2–3 steps (e.g. 'Login | Scan | Export')
- slide-up / fade / blur-in: clean confident reveals when kinetic feels too busy
- NEVER use "static" — text must always have entrance motion

BACKGROUND:
- dark-gradient: safe default, cinematic SaaS
- cinematic-space: deep space/nebula mood — AI tools, futuristic, OpenAI-style launches
- solid-white: Apple keynote, minimal, typography-first
- solid-dark: dark mode products, dev tools, premium contrast

EFFECTS (combine as needed):
- glass: glassmorphism frame — modern AI dashboards, translucent UI products
- dropShadow: floating panel depth — almost always on for window frame
- backgroundBlur: soft atmospheric depth behind the panel — cinematic hero shots

STYLE:
- cornerRadius low/medium/high: match UI roundness in screenshots
- stroke: thin light border — solid-white backgrounds or glass panels
- panelOpacity 0.85–1: lower for glass; 1 for solid

INTRO MOTION (per scene entrance):
- scale-in: premium default
- slide-up: energetic feature reveals
- fade: minimal/editorial
- none: already busy UI, let camera do the work

FORMAT (aspect ratio — pick for the founder, they will not choose):
- 9:16: mobile apps, TikTok/Reels, tall phone screenshots
- 16:9: desktop SaaS, YouTube, website hero, wide UI screenshots (default for web products)
- 1:1: Instagram feed, square marketing
- 4:5: Instagram portrait feed

LENGTH (durationInFrames — pick based on screenshot count + story depth):
- 900 (30s): 1–2 screens, quick hook
- 1800 (60s): 3–4 screens, standard launch
- 2700 (90s): 5–6 screens, feature tour
- 3600 (120s): 7+ screens or deep workflow story

Choose ONE coherent direction. Enterprise B2B → window + linear-style + dark-gradient + dropShadow + 16:9 + blur-fade throughout.
Mobile consumer → phone + slide + grow + 9:16 + blur-scale logo + slide-up transitions.
AI/futuristic → window + linear-style + cinematic-space + glass + dark logo intro + blur-slide-up.

${SCENE_TRANSITION_SKILL_GUIDE}

${SVG_MOTION_SKILL_GUIDE}
`;

export function inferDurationFromSceneCount(sceneCount: number): VideoDurationFrames {
  if (sceneCount <= 2) return 900;
  if (sceneCount <= 4) return 1800;
  if (sceneCount <= 6) return 2700;
  return 3600;
}

export function artDirectionToPanelStyle(art: ArtDirection): PanelVisualStyle {
  return {
    cornerRadius: art.style.cornerRadius,
    glass: art.effects.glass,
    dropShadow: art.effects.dropShadow,
    stroke: art.style.stroke,
    panelOpacity: art.style.panelOpacity,
    backgroundBlur: art.effects.backgroundBlur,
  };
}
