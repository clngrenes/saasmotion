/** Hintergrundmusik-Stile — KI wählt passend zum Produkt-Mood */
export const MUSIC_STYLE_IDS = [
  "ambient",
  "cinematic",
  "upbeat",
  "minimal",
  "tech",
  "none",
] as const;

export type MusicStyleId = (typeof MUSIC_STYLE_IDS)[number];

export const SFX_STYLE_IDS = ["whoosh", "soft", "pop", "none"] as const;
export type SfxStyleId = (typeof SFX_STYLE_IDS)[number];

export const MUSIC_TRACK_FILES: Record<
  Exclude<MusicStyleId, "none">,
  string
> = {
  ambient: "audio/music-ambient.mp3",
  cinematic: "audio/music-cinematic.mp3",
  upbeat: "audio/music-upbeat.mp3",
  minimal: "audio/music-minimal.mp3",
  tech: "audio/music-tech.mp3",
};

export const SFX_TRACK_FILES: Record<Exclude<SfxStyleId, "none">, string> = {
  whoosh: "audio/whoosh.mp3",
  soft: "audio/sfx-soft.mp3",
  pop: "audio/sfx-pop.mp3",
};

/** Dauer der SFX-Dateien in Sekunden (für Frame-Berechnung bei 30fps) */
export const SFX_DURATION_SECONDS: Record<Exclude<SfxStyleId, "none">, number> = {
  whoosh: 0.35,
  soft: 0.2,
  pop: 0.12,
};

export type AudioDirection = {
  readonly reasoning: string;
  readonly musicStyle: MusicStyleId;
  readonly musicVolume: number;
  readonly transitionSfx: SfxStyleId;
  readonly sfxVolume: number;
  readonly playIntroRevealSfx: boolean;
};

export const DEFAULT_AUDIO_DIRECTION: AudioDirection = {
  reasoning: "Balanced cinematic SaaS mix",
  musicStyle: "cinematic",
  musicVolume: 0.16,
  transitionSfx: "whoosh",
  sfxVolume: 0.32,
  playIntroRevealSfx: true,
};

export const AUDIO_SKILL_GUIDE = `
AUDIO DIRECTION — pick music + SFX that match the visual art direction:

MUSIC:
- ambient: calm B2B dashboards, enterprise, trust
- cinematic: AI tools, futuristic launches, OpenAI-style (default for premium)
- upbeat: consumer apps, playful mobile, energetic
- minimal: keynote / solid-white — very subtle bed only
- tech: dev tools, crisp SaaS demos
- none: ONLY for ultra-minimal solid-white when music distracts

TRANSITION SFX (must align with scene cuts):
- whoosh: cinematic scene changes, 3D orbit/dolly (default)
- soft: enterprise, minimal-flat, subtle cuts
- pop: upbeat consumer, punchy UI reveals
- none: only with musicStyle none/minimal keynote

VOLUMES:
- musicVolume 0.10–0.22 (lower for minimal, higher for upbeat)
- sfxVolume 0.22–0.38 (soft for enterprise, louder for upbeat)

playIntroRevealSfx: true when intro title leads into first screenshot (almost always).
`;

export function resolveMusicFile(style: MusicStyleId): string | null {
  if (style === "none") return null;
  return MUSIC_TRACK_FILES[style];
}

export function resolveSfxFile(style: SfxStyleId): string | null {
  if (style === "none") return null;
  return SFX_TRACK_FILES[style];
}
