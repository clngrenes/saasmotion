/** Jitter-style scene transitions — AI picks one for the whole video */
export const SCENE_TRANSITION_IDS = [
  "smooth-fade",
  "blur-fade",
  "blur-slide-up",
  "blur-slide-left",
  "blur-scale",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "wipe-soft",
  "wipe-left",
  "flip-soft",
] as const;

export type SceneTransitionId = (typeof SCENE_TRANSITION_IDS)[number];

export const DEFAULT_SCENE_TRANSITION: SceneTransitionId = "blur-fade";

/** ~0.8s @ 30fps — premium product-demo pacing */
export const DEFAULT_TRANSITION_DURATION_FRAMES = 24;

export const SCENE_TRANSITION_SKILL_GUIDE = `
SCENE TRANSITIONS (between screenshots — Jitter-style, never hard cuts):
Fade family:
- smooth-fade: clean crossfade
- blur-fade: blur + crossfade — Apple/Linear default

Blur combos (Jitter Blur & Slide / Blur & Scale):
- blur-slide-up: blurred panel rises into place
- blur-slide-left: blurred panel slides from right
- blur-scale: blur + zoom between scenes — launch energy

Slide family:
- slide-left / slide-right / slide-up / slide-down: directional slides

Wipe / Flip:
- wipe-soft: soft bottom wipe — editorial
- wipe-left: left wipe — bold cuts
- flip-soft: 3D card flip — playful consumer apps
`;
