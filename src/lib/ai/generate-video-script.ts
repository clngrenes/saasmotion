import { generateObject } from "ai";
import { z } from "zod";
import {
  BACKGROUND_STYLE_IDS,
  CORNER_RADIUS_IDS,
  INTRO_MOTION_IDS,
  ART_DIRECTION_SKILL_GUIDE,
  VIDEO_ASPECT_RATIO_IDS,
} from "../../remotion/art-direction/catalog";
import {
  AUDIO_SKILL_GUIDE,
  MUSIC_STYLE_IDS,
  SFX_STYLE_IDS,
} from "../../remotion/constants/audio-catalog";
import { TEXT_PRESET_IDS, type TextPresetId } from "../../remotion/text-presets/catalog";
import { CAMERA_PRESET_NAMES } from "../../remotion/types/screenshot-video";
import type { GeneratedVideoScript } from "../../types/video-script";
import { scriptModel } from "./google";
import { trimProductContext } from "./trim-product-context";

const scriptSchema = z.object({
  productName: z.string().min(1).max(60),
  tagline: z.string().min(1).max(140),
  scenes: z.array(
    z.object({
      headline: z.string().min(1).max(100),
      subline: z.string().max(180),
    }),
  ),
  artDirection: z.object({
    reasoning: z.string().min(1).max(400),
    cameraPreset: z.enum(CAMERA_PRESET_NAMES),
    frameStyle: z.enum(["phone", "window"]),
    textPreset: z.enum(TEXT_PRESET_IDS as unknown as [TextPresetId, ...TextPresetId[]]),
    aspectRatio: z.enum(VIDEO_ASPECT_RATIO_IDS),
    durationInFrames: z.union([
      z.literal(900),
      z.literal(1800),
      z.literal(2700),
      z.literal(3600),
    ]),
    background: z.enum(BACKGROUND_STYLE_IDS),
    effects: z.object({
      glass: z.boolean(),
      dropShadow: z.boolean(),
      backgroundBlur: z.boolean(),
    }),
    style: z.object({
      cornerRadius: z.enum(CORNER_RADIUS_IDS),
      stroke: z.boolean(),
      panelOpacity: z.number().min(0.8).max(1),
    }),
    introMotion: z.enum(INTRO_MOTION_IDS),
  }),
  audioDirection: z.object({
    reasoning: z.string().min(1).max(300),
    musicStyle: z.enum(MUSIC_STYLE_IDS),
    musicVolume: z.number().min(0.08).max(0.28),
    transitionSfx: z.enum(SFX_STYLE_IDS),
    sfxVolume: z.number().min(0.18).max(0.45),
    playIntroRevealSfx: z.boolean(),
  }),
});

function buildPrompt(input: {
  productDescription: string;
  productContext?: string;
  screenshotNames: readonly string[];
  hasVision: boolean;
}): string {
  const sceneCount = Math.max(1, input.screenshotNames.length);
  const context = trimProductContext(input.productContext);

  return `You are a creative director AND motion art director for premium SaaS launch videos (Apple, Linear, OpenAI).

The user is a founder — they know their product, NOT motion design. You decide EVERYTHING visual and sonic: format, length, camera, text animation, music, SFX. They only upload screenshots and an optional brief.

Write a short, punchy promo script in English AND choose the complete creative direction from the skill catalog below.

${input.hasVision ? "You can SEE each screenshot image below — study the UI carefully (layout, colors, roundness, mobile vs desktop)." : "You only have screenshot file names — infer platform from names when possible."}

COPY RULES:
- Exactly ${sceneCount} scenes — one per screenshot, in upload order
- Each headline/subline MUST match what is visible on that specific screenshot
- Cross-check with product context (.env/README) — do not contradict the product
- Do not invent features, screens, or data that are not visible or documented
- Headlines: short, benefit-driven
- Sublines: one concrete sentence tied to that screen
- Scene 1 = strong hook for what the first screen shows
- Final scene = CTA or key benefit from the last screen
- Never quote secrets from env files

ART DIRECTION RULES:
- Pick ONE coherent visual direction for the whole video — the founder will not adjust anything
- aspectRatio: infer from screenshot shape and product type (mobile app → 9:16, desktop SaaS → 16:9)
- durationInFrames: match screenshot count — 1–2 screens → 900, 3–4 → 1800, 5–6 → 2700, 7+ → 3600
- Match frameStyle to screenshot aspect (wide/desktop → window, tall/mobile → phone)
- Use glass + cinematic-space for AI/futuristic products; solid-white for minimal keynote style
- dropShadow: true for floating window panels; false only for flat minimal on white
- reasoning: 1–2 sentences in plain English (founder-friendly, no jargon)

${ART_DIRECTION_SKILL_GUIDE}

AUDIO RULES:
- Also pick music + transition SFX that match the visual direction
- SFX must feel synced to scene cuts — whoosh for cinematic, soft for enterprise, pop for upbeat
- playIntroRevealSfx: true when intro title leads into first screenshot (default true)
- Do NOT pick musicStyle none unless solid-white keynote minimal

${AUDIO_SKILL_GUIDE}

Product description:
${input.productDescription}

Screenshots (order):
${input.screenshotNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

${context ? `Product context (env/README/package — may contain secrets, do not quote):\n${context}` : ""}`;
}

export async function generateVideoScript(input: {
  productDescription: string;
  productContext?: string;
  screenshotNames: readonly string[];
  screenshotUrls?: readonly string[];
}): Promise<GeneratedVideoScript> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY fehlt. Trage den Key in .env.local bzw. Vercel Environment Variables ein.",
    );
  }

  const sceneCount = Math.max(1, input.screenshotNames.length);
  const visionUrls = (input.screenshotUrls ?? []).filter(Boolean);
  const hasVision = visionUrls.length === sceneCount;

  const prompt = buildPrompt({
    productDescription: input.productDescription,
    productContext: input.productContext,
    screenshotNames: input.screenshotNames,
    hasVision,
  });

  const imageParts = hasVision
    ? visionUrls.flatMap((url, index) => [
        { type: "text" as const, text: `Screenshot ${index + 1} (${input.screenshotNames[index] ?? "screen"}):` },
        { type: "image" as const, image: url },
      ])
    : [];

  const { object } = await generateObject({
    model: scriptModel,
    schema: scriptSchema,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }, ...imageParts],
      },
    ],
  });

  if (object.scenes.length !== sceneCount) {
    const scenes = [...object.scenes];
    while (scenes.length < sceneCount) {
      scenes.push({
        headline: `Feature ${scenes.length + 1}`,
        subline: object.tagline,
      });
    }
    return {
      productName: object.productName,
      tagline: object.tagline,
      scenes: scenes.slice(0, sceneCount),
      artDirection: object.artDirection,
      audioDirection: object.audioDirection,
    };
  }

  return object;
}
