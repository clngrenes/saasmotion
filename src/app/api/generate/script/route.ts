import { NextResponse } from "next/server";
import { z } from "zod";
import { generateVideoScript } from "../../../../lib/ai/generate-video-script";
import { trimProductContext } from "../../../../lib/ai/trim-product-context";

export const maxDuration = 300; // Allow enough time for script generation

const requestSchema = z.object({
  productDescription: z.string().min(10).max(4000),
  productContext: z.string().max(500_000).optional(),
  funnelStage: z.enum(["awareness", "consideration", "conversion"]),
  stylePackId: z.enum(["linear", "auto"]).optional(),
  screenshotNames: z.array(z.string().min(1)).min(1).max(8),
  screenshotUrls: z.array(z.string().url()).min(1).max(8).optional(),
  hasLogo: z.boolean().optional(),
  requestedDuration: z.number().optional(),
  requestedAspectRatio: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const body = requestSchema.parse({
      ...raw,
      productContext: raw.productContext
        ? trimProductContext(String(raw.productContext))
        : undefined,
    });
    const script = await generateVideoScript(body);
    return NextResponse.json(script);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      const message =
        first?.path[0] === "productContext"
          ? "Context file is too large — only the first 12,000 characters are used."
          : (first?.message ?? "Invalid request");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Script-Generierung fehlgeschlagen";
    console.error("[generate/script]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
