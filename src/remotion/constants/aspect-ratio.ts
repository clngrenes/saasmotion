export const VIDEO_ASPECT_RATIO_OPTIONS = [
  { id: "9:16", label: "Story", sublabel: "9:16", width: 1080, height: 1920 },
  { id: "16:9", label: "Wide", sublabel: "16:9", width: 1920, height: 1080 },
  { id: "1:1", label: "Square", sublabel: "1:1", width: 1080, height: 1080 },
  { id: "4:5", label: "Feed", sublabel: "4:5", width: 1080, height: 1350 },
] as const;

export type VideoAspectRatioId =
  (typeof VIDEO_ASPECT_RATIO_OPTIONS)[number]["id"];

export const DEFAULT_VIDEO_ASPECT_RATIO: VideoAspectRatioId = "9:16";

export function getVideoDimensions(aspectRatio: VideoAspectRatioId): {
  width: number;
  height: number;
} {
  const option = VIDEO_ASPECT_RATIO_OPTIONS.find((o) => o.id === aspectRatio);
  return option ?? VIDEO_ASPECT_RATIO_OPTIONS[0];
}
