/** Bundled audio — works offline on VPS render worker (no external URLs) */
export const BACKGROUND_MUSIC_FILE = "audio/background.mp3";
export const TRANSITION_SFX_FILE = "audio/whoosh.mp3";

/** @deprecated Use BACKGROUND_MUSIC_FILE + staticFile() — external Mixkit URLs fail headless */
export const DEFAULT_BACKGROUND_MUSIC_URL = BACKGROUND_MUSIC_FILE;
export const DEFAULT_TRANSITION_SFX_URL = TRANSITION_SFX_FILE;

export const INTRO_DURATION_FRAMES = 60;
