import type { TextPresetId } from "../text-presets/catalog";
import { DEFAULT_TEXT_PRESET } from "../text-presets/catalog";
import type { CameraPresetName, FrameStyleId } from "../types/screenshot-video";

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
export type ArtDirection = {
  readonly reasoning: string;
  readonly cameraPreset: CameraPresetName;
  readonly frameStyle: FrameStyleId;
  readonly textPreset: TextPresetId;
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
};

export const DEFAULT_ART_DIRECTION: ArtDirection = {
  reasoning: "Default cinematic SaaS look",
  cameraPreset: "apple-style",
  frameStyle: "window",
  textPreset: DEFAULT_TEXT_PRESET,
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

TRANSFORM (camera / motion):
- zelios-style (Dolly): slow push-in, subtle Y swing — enterprise, calm, trustworthy
- apple-style (3D Orbit): smooth isometric X+Y rotation — premium product demos (OpenAI/Linear style)
- minimal-flat (Slide): flat slide-up, no rotation — playful, simple, mobile-first apps

FRAME:
- window: desktop/web UI floating panel — SaaS dashboards, web apps (default for desktop screenshots)
- phone: device frame — mobile apps, iOS/Android screenshots

TEXT ANIMATION:
- kinetic-timeline: Process visualization. AI MUST use '|' in subline to separate 2-3 steps (e.g. 'Login | Scan | Export'). Headline acts as typing narration.
- kinetic-pills / kinetic-words / kinetic-chat: high-end "Aside/Linear" motion. Words stagger in sequentially. Chat is for conversational tools.
- slide-up / slide-down / slide-left / slide-right: confident product reveals
- fade / blur-in: subtle, editorial, minimal
- mask-up / mask-down: bold, Jitter-style editorial
- grow / shrink: energetic, consumer, launch energy

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

Choose ONE coherent direction. Enterprise B2B → window + orbit/dolly + dark-gradient + dropShadow.
Mobile consumer → phone + slide + grow. AI/futuristic → window + orbit + cinematic-space + glass.
`;

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
