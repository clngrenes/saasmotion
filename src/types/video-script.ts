/** Von der KI generiertes Script (ohne Screenshot-URLs) */
export type GeneratedSceneCopy = {
  readonly headline: string;
  readonly subline: string;
};

export type GeneratedArtDirection = {
  readonly reasoning: string;
  readonly cameraPreset: "zelios-style" | "apple-style" | "minimal-flat";
  readonly frameStyle: "phone" | "window";
  readonly textPreset: string;
  readonly aspectRatio: "9:16" | "16:9" | "1:1" | "4:5";
  readonly durationInFrames: 900 | 1800 | 2700 | 3600;
  readonly background: "dark-gradient" | "cinematic-space" | "solid-white" | "solid-dark";
  readonly effects: {
    readonly glass: boolean;
    readonly dropShadow: boolean;
    readonly backgroundBlur: boolean;
  };
  readonly style: {
    readonly cornerRadius: "low" | "medium" | "high";
    readonly stroke: boolean;
    readonly panelOpacity: number;
  };
  readonly introMotion: "scale-in" | "slide-up" | "fade" | "none";
  readonly sceneTransition:
    | "smooth-fade"
    | "blur-fade"
    | "blur-slide-up"
    | "blur-slide-left"
    | "blur-scale"
    | "slide-left"
    | "slide-right"
    | "slide-up"
    | "slide-down"
    | "wipe-soft"
    | "wipe-left"
    | "flip-soft";
  readonly logoIntroMotion:
    | "fade"
    | "blur-fade"
    | "blur-slide-up"
    | "blur-slide-left"
    | "blur-scale"
    | "scale-grow"
    | "slide-up"
    | "slide-left"
    | "mask-reveal-up"
    | "mask-reveal-center";
  readonly logoIntroBackdrop: "white" | "dark";
  readonly svgMotion:
    | "none"
    | "ambient-blobs"
    | "stroke-frame"
    | "radial-burst"
    | "orbit-dots"
    | "shape-pop"
    | "wave-underline"
    | "mesh-glow";
  readonly svgAccent: "violet" | "cyan" | "emerald" | "rose" | "amber" | "neutral";
};

export type GeneratedAudioDirection = {
  readonly reasoning: string;
  readonly musicStyle: "ambient" | "cinematic" | "upbeat" | "minimal" | "tech" | "none";
  readonly musicVolume: number;
  readonly transitionSfx: "whoosh" | "soft" | "pop" | "none";
  readonly sfxVolume: number;
  readonly playIntroRevealSfx: boolean;
};

export type GeneratedVideoScript = {
  readonly productName: string;
  readonly tagline: string;
  readonly scenes: readonly GeneratedSceneCopy[];
  readonly artDirection: GeneratedArtDirection;
  readonly audioDirection: GeneratedAudioDirection;
};

export type GenerateScriptRequest = {
  readonly productDescription: string;
  readonly productContext?: string;
  readonly screenshotNames: readonly string[];
  readonly screenshotUrls?: readonly string[];
  readonly hasLogo?: boolean;
  readonly requestedDuration?: number;
  readonly requestedAspectRatio?: "9:16" | "16:9" | "1:1" | "4:5";
};

export type GenerateScriptResponse = GeneratedVideoScript;
