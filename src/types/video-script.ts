/** Eine Szene im Promo-Video: Screenshot + Marketing-Copy */
export type VideoScene = {
  readonly screenshotUrl: string;
  readonly headline: string;
  readonly subline: string;
};

/** Von der KI generiertes Script (ohne Screenshot-URLs) */
export type GeneratedSceneCopy = {
  readonly headline: string;
  readonly subline: string;
};

export type GeneratedVideoScript = {
  readonly productName: string;
  readonly tagline: string;
  readonly scenes: readonly GeneratedSceneCopy[];
};

export type GenerateScriptRequest = {
  readonly productDescription: string;
  readonly productContext?: string;
  readonly screenshotNames: readonly string[];
};

export type GenerateScriptResponse = GeneratedVideoScript;
