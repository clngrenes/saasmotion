import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { GeneratedVideoScript } from "../../types/video-script";

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY fehlt. Trage den Key in .env.local bzw. Vercel Environment Variables ein.",
    );
  }

  const openai = createOpenAI({ apiKey });
  const sceneCount = Math.max(1, input.screenshotNames.length);
  const context = trimContext(input.productContext);

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: scriptSchema,
    prompt: `Du bist ein Creative Director für SaaS-Produktvideos im Stil von Apple/xAI/Grok.

Erstelle ein kurzes, punchy Promo-Script auf Englisch (auch wenn die Beschreibung Deutsch ist).

Regeln:
- Genau ${sceneCount} Szenen — eine pro Screenshot, in Upload-Reihenfolge
- Headlines: kurz, benefit-driven, keine Floskeln
- Sublines: 1 kurzer Satz, konkret
- Szene 1 = starker Hook / Intro-Moment
- Letzte Szene = CTA oder Key Benefit
- Nutze Produktkontext nur für Fakten, erfinde keine Features
- Wiederhole keine Secrets aus .env-Dateien

Produktbeschreibung:
${input.productDescription}

Screenshot-Dateien (Reihenfolge):
${input.screenshotNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

${context ? `Produktkontext (env/README/package — kann Secrets enthalten, nicht zitieren):\n${context}` : ""}`,
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
