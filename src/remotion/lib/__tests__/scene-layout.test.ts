import { describe, expect, it } from "vitest";
import { computeSceneTypographyLayout } from "../scene-layout";

describe("computeSceneTypographyLayout", () => {
  it("keeps 16:9 type from blowing up vs short-side scaling", () => {
    const wide = computeSceneTypographyLayout(1920, 1080, "solid-dark");
    const story = computeSceneTypographyLayout(1080, 1920, "solid-dark");
    expect(wide.orientation).toBe("landscape");
    expect(story.orientation).toBe("portrait");
    expect(wide.textPlacement).toBe("bottom");
    expect(story.textPlacement).toBe("top");
    expect(wide.headlineSize).toBeLessThanOrEqual(56);
    expect(story.headlineSize).toBeGreaterThanOrEqual(28);
    // Wide canvas must not make type ~2x larger than portrait
    expect(wide.headlineSize / story.headlineSize).toBeLessThan(1.35);
  });

  it("reserves UI clear of the text band on every ratio", () => {
    for (const [w, h] of [
      [1920, 1080],
      [1080, 1920],
      [1080, 1080],
      [1080, 1350],
    ] as const) {
      const layout = computeSceneTypographyLayout(w, h, "solid-dark");
      expect(layout.maxUiHeightRatio + layout.textBandRatio).toBeLessThanOrEqual(0.9);
      expect(layout.maxTextWidth).toBeLessThan(w);
      expect(layout.paddingX * 2 + layout.maxTextWidth).toBeLessThanOrEqual(w + 2);
    }
  });

  it("switches to dark text on white backgrounds", () => {
    const light = computeSceneTypographyLayout(1920, 1080, "solid-white");
    const dark = computeSceneTypographyLayout(1920, 1080, "solid-dark");
    expect(light.headlineColor).toBe("#0a0a0b");
    expect(dark.headlineColor).toBe("#ffffff");
  });
});
