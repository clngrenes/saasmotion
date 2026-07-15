import { NextResponse } from "next/server";
import { z } from "zod";
import { reconstructScreenshot } from "../../../../lib/ai/reconstruct-screenshot";

export const maxDuration = 300; // Allow enough time for 2-pass verification

const requestSchema = z.object({
  screenshotUrl: z.string().url(),
  screenshotName: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const uiTree = await reconstructScreenshot(body);
    return NextResponse.json({ uiTree });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "UI reconstruction failed";
    console.error("[reconstruct/screenshot]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
