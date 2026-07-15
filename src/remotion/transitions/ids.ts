export const SCENE_TRANSITION_IDS = [
  "smooth-fade",
  "blur-fade",
  "slide-left",
  "slide-up",
  "wipe-soft",
] as const;

export type SceneTransitionId = (typeof SCENE_TRANSITION_IDS)[number];

export const DEFAULT_SCENE_TRANSITION: SceneTransitionId = "blur-fade";

/** ~0.8s @ 30fps — premium product-demo pacing */
export const DEFAULT_TRANSITION_DURATION_FRAMES = 24;

export const SCENE_TRANSITION_SKILL_GUIDE = `
SCENE TRANSITIONS (between screenshots — never hard cuts):
- smooth-fade: cinematic crossfade — default for premium SaaS
- blur-fade: soft blur + crossfade — Apple/Linear launch style (best default)
- slide-left: next screen slides in from the right — energetic mobile apps
- slide-up: screen rises into place — feature reveals, dashboards
- wipe-soft: subtle wipe from bottom — editorial / keynote
`;
