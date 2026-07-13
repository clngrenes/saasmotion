import { NextResponse } from "next/server";
import { getServiceSupabase } from "../../../../lib/supabase/server";

const BUCKET = "screenshots";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, and WebP screenshots are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Screenshot must be 10 MB or smaller" },
        { status: 400 },
      );
    }

    const supabase = getServiceSupabase();
    const objectPath = `${crypto.randomUUID()}.${extensionForMime(file.type)}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;

    return NextResponse.json({ url: publicUrl, path: objectPath });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("[upload/screenshot]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
