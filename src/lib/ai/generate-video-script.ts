import { generateObject } from "ai";
import { z } from "zod";
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
});

function buildPrompt(input: {
  productDescription: string;
  productContext?: string;
  screenshotNames: readonly string[];
  hasVision: boolean;
}): string {
  const sceneCount = Math.max(1, input.screenshotNames.length);
  const context = trimProductContext(input.productContext);

  return `You are a creative director for premium SaaS launch videos (Apple, Linear).

Write a short, punchy promo script in English.

${input.hasVision ? "You can SEE each screenshot image below — study the UI carefully." : "You only have screenshot file names — stay generic and avoid inventing specific UI details."}

Rules:
- Exactly ${sceneCount} scenes — one per screenshot, in upload order
- Each headline/subline MUST match what is visible on that specific screenshot
- Cross-check with product context (.env/README) — do not contradict the product
- Do not invent features, screens, or data that are not visible or documented
- Headlines: short, benefit-driven
- Sublines: one concrete sentence tied to that screen
- Scene 1 = strong hook for what the first screen shows
- Final scene = CTA or key benefit from the last screen
- Never quote secrets from env files

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
    };
  }

  return object;
}
