import { generateObject } from "ai";
import { z } from "zod";
import {
  BACKGROUND_STYLE_IDS,
  CORNER_RADIUS_IDS,
  INTRO_MOTION_IDS,
  ART_DIRECTION_SKILL_GUIDE,
  VIDEO_ASPECT_RATIO_IDS,
  VIDEO_DURATION_FRAME_STRINGS,
  parseDurationInFrames,
} from "../../remotion/art-direction/catalog";
import {
  AUDIO_SKILL_GUIDE,
  MUSIC_STYLE_IDS,
  SFX_STYLE_IDS,
} from "../../remotion/constants/audio-catalog";
import { TEXT_PRESET_IDS, type TextPresetId } from "../../remotion/text-presets/catalog";
import { CAMERA_PRESET_NAMES } from "../../remotion/types/screenshot-video";
import { SCENE_TRANSITION_IDS } from "../../remotion/transitions/ids";
import {
  LOGO_INTRO_BACKDROP_IDS,
  LOGO_INTRO_MOTION_IDS,
} from "../../remotion/motion-skills/ids";
import {
  SVG_ACCENT_IDS,
  SVG_MOTION_IDS,
} from "../../remotion/motion-skills/svg/ids";
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
      focusElementId: z.string().max(40).optional(),
    }),
  ),
  artDirection: z.object({
    reasoning: z.string().min(1).max(400),
    cameraPreset: z.enum(CAMERA_PRESET_NAMES),
    frameStyle: z.enum(["phone", "window"]),
    textPreset: z.enum(TEXT_PRESET_IDS as unknown as [TextPresetId, ...TextPresetId[]]),
    aspectRatio: z.enum(VIDEO_ASPECT_RATIO_IDS),
    durationInFrames: z.enum(VIDEO_DURATION_FRAME_STRINGS),
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
    sceneTransition: z.enum(SCENE_TRANSITION_IDS),
    logoIntroMotion: z.enum(LOGO_INTRO_MOTION_IDS),
    logoIntroBackdrop: z.enum(LOGO_INTRO_BACKDROP_IDS),
    svgMotion: z.enum(SVG_MOTION_IDS),
    svgAccent: z.enum(SVG_ACCENT_IDS),
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

type ScriptSchemaOutput = z.infer<typeof scriptSchema>;

function toGeneratedVideoScript(
  object: ScriptSchemaOutput,
  sceneCount: number,
  requestedDuration?: number,
  requestedAspectRatio?: string,
): GeneratedVideoScript {
  return {
    productName: object.productName,
    tagline: object.tagline,
    scenes: object.scenes,
    artDirection: {
      ...object.artDirection,
      textPreset: "static",
      durationInFrames: parseDurationInFrames(
        requestedDuration ?? object.artDirection.durationInFrames,
        sceneCount,
      ),
      aspectRatio: (requestedAspectRatio as any) ?? object.artDirection.aspectRatio,
    },
    audioDirection: object.audioDirection,
  };
}

function buildPrompt(input: {
  productDescription: string;
  productContext?: string;
  funnelStage: "awareness" | "consideration" | "conversion";
  screenshotNames: readonly string[];
  hasVision: boolean;
  hasLogo: boolean;
  requestedDuration?: number;
  requestedAspectRatio?: string;
}): string {
  const sceneCount = Math.max(1, input.screenshotNames.length);
  const context = trimProductContext(input.productContext);

  return `You are a creative director AND motion art director for premium SaaS launch videos (Apple, Linear, OpenAI).

The user is a founder — they know their product, NOT motion design. You decide EVERYTHING visual and sonic: format, length, camera, text animation, music, SFX. They only upload screenshots and an optional brief.

SALES FUNNEL STAGE: "${input.funnelStage.toUpperCase()}"
Adapt the script and pacing to this funnel stage:
- AWARENESS: Story-led, focus on universal pain points and curiosity. "Why should I care?" No deep UI details.
- CONSIDERATION: Concrete UI walkthroughs, feature proof, comparison ("old way vs new way"). "How does it work?"
- CONVERSION: High urgency, metrics, proof of ROI, fast pacing. Direct CTA (Sign up, Free trial). "I need this now."

Write a short, punchy promo script in English AND choose the complete creative direction from the skill catalog below.

${input.hasVision ? "You can SEE each screenshot image below — study the UI carefully (layout, colors, roundness, mobile vs desktop)." : "You only have screenshot file names — infer platform from names when possible."}

COPY RULES:
- Exactly ${sceneCount} scenes — one per screenshot, in upload order
- Each headline/subline MUST match what is visible on that specific screenshot
- focusElementId: optional — pick the most prominent UI layer id when focusableIds are provided in a later step; omit if unknown
- Cross-check with product context (.env/README) — do not contradict the product
- Do not invent features, screens, or data that are not visible or documented
- Headlines: short, benefit-driven
- Sublines: one concrete sentence tied to that screen
- Scene 1 = strong hook for what the first screen shows
- Final scene = CTA or key benefit from the last screen
- Never quote secrets from env files

ART DIRECTION RULES:
- Pick ONE coherent visual direction for the whole video — the founder will not adjust anything
- aspectRatio: ${input.requestedAspectRatio ? `MUST USE "${input.requestedAspectRatio}"` : "infer from screenshot shape and product type (mobile app → 9:16, desktop SaaS → 16:9)"}
- durationInFrames: ${input.requestedDuration ? `MUST USE "${input.requestedDuration}". Since the user locked this duration, if it's long (e.g. 1800+) but screenshot count is low, you MUST write rich, engaging, multi-part story copy to fill the time!` : "match screenshot count — 1–2 screens → \"900\", 3–4 → \"1800\", 5–6 → \"2700\", 7+ → \"3600\" (string values)"}
- Match frameStyle to screenshot aspect (wide/desktop → window, tall/mobile → phone)
- cameraPreset: use "crash-zoom" for CONVERSION funnel stage (fast, aggressive). Otherwise prefer "linear-style" for desktop/high-end products. Use "minimal-flat" only for very simple mobile apps.
- textPreset: MUST ALWAYS be "static" — no text motion, headlines stay fixed on screen
- Use glass + cinematic-space for AI/futuristic products; solid-white for minimal keynote style
- dropShadow: true for floating window panels; false only for flat minimal on white
- Pick logoIntroMotion + logoIntroBackdrop + sceneTransition + svgMotion as ONE Jitter-style motion language (see skill guide)
- logoIntroBackdrop: white for light/minimal products, dark for dev tools & AI
- svgMotion: only when logo is uploaded — use "none" when no logo; pick svgAccent from dominant UI brand color
${input.hasLogo ? "- Logo IS uploaded — choose a svgMotion skill that complements logoIntroMotion" : "- No logo uploaded — svgMotion MUST be none"}

${ART_DIRECTION_SKILL_GUIDE}

AUDIO RULES:
- musicStyle: almost always cinematic or tech — NEVER none unless solid-white keynote
- transitionSfx is auto-matched to sceneTransition on our side — pick whoosh for slides/wipes, soft for fades
- playIntroRevealSfx: true ONLY when logo is uploaded; false when no logo
- musicVolume 0.15–0.22, sfxVolume 0.24–0.36
${input.hasLogo ? "" : "- No logo → playIntroRevealSfx MUST be false"}

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
  funnelStage: "awareness" | "consideration" | "conversion";
  screenshotNames: readonly string[];
  screenshotUrls?: readonly string[];
  hasLogo?: boolean;
  requestedDuration?: number;
  requestedAspectRatio?: string;
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
    funnelStage: input.funnelStage,
    screenshotNames: input.screenshotNames,
    hasVision,
    hasLogo: input.hasLogo ?? false,
    requestedDuration: input.requestedDuration,
    requestedAspectRatio: input.requestedAspectRatio,
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
    return toGeneratedVideoScript(
      { ...object, scenes: scenes.slice(0, sceneCount) },
      sceneCount,
      input.requestedDuration,
      input.requestedAspectRatio,
    );
  }

  return toGeneratedVideoScript(object, sceneCount, input.requestedDuration, input.requestedAspectRatio);
}
