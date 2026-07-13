import { generateObject } from "ai";
import { z } from "zod";
import type { GeneratedVideoScript } from "../../types/video-script";
import { scriptModel } from "./google";

const scriptSchema = z.object({
  productName: z.string().min(1).max(60),
  tagline: z.string().min(1).max(140),
  scenes: z.array(
    z.object({
      headline: z.string().min(1).max(100),
      subline: z.string().max(180),
    }),
  ),
});

const MAX_CONTEXT_CHARS = 12_000;

function trimContext(context: string | undefined): string {
  if (!context) return "";
  return context.slice(0, MAX_CONTEXT_CHARS);
}

export async function generateVideoScript(input: {
  productDescription: string;
  productContext?: string;
  screenshotNames: readonly string[];
}): Promise<GeneratedVideoScript> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY fehlt. Trage den Key in .env.local bzw. Vercel Environment Variables ein.",
    );
  }

  const sceneCount = Math.max(1, input.screenshotNames.length);
  const context = trimContext(input.productContext);

  const { object } = await generateObject({
    model: scriptModel,
    schema: scriptSchema,
    prompt: `You are a creative director for premium SaaS launch videos (Apple, Linear, Grok).

Write a short, punchy promo script in English.

Rules:
- Exactly ${sceneCount} scenes — one per screenshot, in upload order
- Headlines: short, benefit-driven, no fluff
- Sublines: one concrete sentence each
- Scene 1 = strong hook
- Final scene = CTA or key benefit
- Use product context for facts only — do not invent features
- Never repeat secrets from env files

Product description:
${input.productDescription}

Screenshots (order):
${input.screenshotNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

${context ? `Product context (env/README/package — may contain secrets, do not quote):\n${context}` : ""}`,
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
    };
  }

  return object;
}
