/** Jitter-style logo intro presets — AI picks one */
export const LOGO_INTRO_MOTION_IDS = [
  "fade",
  "blur-fade",
  "blur-slide-up",
  "blur-slide-left",
  "blur-scale",
  "scale-grow",
  "slide-up",
  "slide-left",
  "mask-reveal-up",
  "mask-reveal-center",
] as const;

export type LogoIntroMotionId = (typeof LOGO_INTRO_MOTION_IDS)[number];

export const DEFAULT_LOGO_INTRO_MOTION: LogoIntroMotionId = "blur-fade";

export const LOGO_INTRO_BACKDROP_IDS = ["white", "dark"] as const;
export type LogoIntroBackdropId = (typeof LOGO_INTRO_BACKDROP_IDS)[number];

export const DEFAULT_LOGO_INTRO_BACKDROP: LogoIntroBackdropId = "white";

export const LOGO_INTRO_SKILL_GUIDE = `
LOGO INTRO (opening beat — logo only, no text; skip if no logo uploaded):
Backdrop:
- white: Jitter-style clean canvas — minimal SaaS, keynote, light UI products
- dark: cinematic reveal — dev tools, dark-mode apps, AI/futuristic

Logo motion (Jitter Fade / Blur / Mask presets):
- blur-fade: soft blur clears into sharp logo — premium default (Linear/Jitter)
- fade: simple opacity fade — ultra-minimal
- blur-slide-up: blur + rises into place — energetic consumer apps
- blur-slide-left: blur + slides from right — horizontal brand reveals
- blur-scale: blur + grows — launch energy, mobile apps
- scale-grow: scale up without blur — confident B2B
- slide-up / slide-left: directional slide without blur — playful
- mask-reveal-up: mask wipe upward — editorial Jitter Mask Reveal
- mask-reveal-center: iris expand from center — bold hero moment
`;

export const MOTION_DIRECTOR_SKILL_GUIDE = `
You are the motion director. Pick ONE coherent motion language across logo intro, scene transitions, text, and panel entrance — like choosing Jitter presets for the whole video.

Match motion to product mood:
- Premium B2B / Linear style → blur-fade logo + blur-fade scenes + kinetic-words + scale-in panels
- Playful mobile → blur-scale logo + slide-up scenes + grow text + slide-up panels
- Minimal keynote → fade logo on white + smooth-fade scenes + fade text + fade panels
- AI / futuristic → blur-fade on dark + blur-slide-up scenes + blur-in text + cinematic-space
- Editorial / Aside → mask-reveal logo + wipe-soft scenes + kinetic-pills + mask-up text

Never mix chaotic directions (e.g. flip transitions + minimal fade logo + kinetic-chat).
${LOGO_INTRO_SKILL_GUIDE}
`;
