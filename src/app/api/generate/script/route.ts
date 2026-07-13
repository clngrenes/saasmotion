import { NextResponse } from "next/server";
import { z } from "zod";
import { generateVideoScript } from "../../../../lib/ai/generate-video-script";

const requestSchema = z.object({
  productDescription: z.string().min(10).max(4000),
  productContext: z.string().max(12_000).optional(),
  screenshotNames: z.array(z.string().min(1)).min(1).max(8),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const script = await generateVideoScript(body);
    return NextResponse.json(script);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Script-Generierung fehlgeschlagen";
    console.error("[generate/script]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
