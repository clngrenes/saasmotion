import { describe, expect, it } from "vitest";
import {
  computePresetFrame,
  computeScreenInlay,
  DEVICE_FRAME,
  PRESET_CAMERA_CONFIG,
  PRESET_REGISTRY,
} from "../index";
import type { PresetFrameContext } from "../../types/screenshot-video";

const DURATION = 150;
const FPS = 30;

const ctx = (frame: number): PresetFrameContext => ({
  frame,
  durationInFrames: DURATION,
  fps: FPS,
});

describe("preset registry", () => {
  it("registers all known presets with camera configs", () => {
    expect(Object.keys(PRESET_REGISTRY).sort()).toEqual([
      "apple-style",
      "crash-zoom",
      "linear-style",
      "minimal-flat",
      "zelios-style",
    ]);
    expect(Object.keys(PRESET_CAMERA_CONFIG).sort()).toEqual([
      "apple-style",
      "crash-zoom",
      "linear-style",
      "minimal-flat",
      "zelios-style",
    ]);
  });
});

describe("zelios-style", () => {
  it("dollies the camera in on Z from start to end", () => {
    const start = computePresetFrame("zelios-style", ctx(0));
    const end = computePresetFrame("zelios-style", ctx(DURATION));
    expect(start.camera.position[2]).toBeCloseTo(9.0, 5);
    expect(end.camera.position[2]).toBeCloseTo(5.8, 5);
    expect(end.camera.position[2]).toBeLessThan(start.camera.position[2]);
  });

  it("swings the camera on the Y axis and keeps the mesh static", () => {
    const start = computePresetFrame("zelios-style", ctx(0));
    const end = computePresetFrame("zelios-style", ctx(DURATION));
    expect(start.camera.rotation[1]).toBeCloseTo(-0.12, 5);
    expect(end.camera.rotation[1]).toBeCloseTo(0.08, 5);
    expect(start.mesh.position).toEqual(end.mesh.position);
    expect(start.mesh.rotation).toEqual(end.mesh.rotation);
  });
});

describe("apple-style", () => {
  it("smoothly rotates the mesh through an isometric arc", () => {
    const start = computePresetFrame("apple-style", ctx(0));
    const mid = computePresetFrame("apple-style", ctx(DURATION / 2));
    const end = computePresetFrame("apple-style", ctx(DURATION));

    expect(start.camera.position).toEqual(end.camera.position);
    expect(start.camera.rotation).toEqual([0, 0, 0]);

    expect(start.mesh.rotation[0]).toBeGreaterThan(end.mesh.rotation[0]);
    expect(start.mesh.rotation[1]).toBeLessThan(0);
    expect(end.mesh.rotation[1]).toBeGreaterThan(0);
    expect(mid.mesh.rotation[1]).toBeGreaterThan(start.mesh.rotation[1]);
    expect(mid.mesh.rotation[1]).toBeLessThan(end.mesh.rotation[1]);
  });
});

describe("minimal-flat", () => {
  it("slides the mesh up from below with no rotation", () => {
    const start = computePresetFrame("minimal-flat", ctx(0));
    const slideEnd = computePresetFrame(
      "minimal-flat",
      ctx(Math.round(DURATION * 0.7)),
    );
    const end = computePresetFrame("minimal-flat", ctx(DURATION));

    expect(start.mesh.position[1]).toBeCloseTo(-4.0, 5);
    expect(slideEnd.mesh.position[1]).toBeCloseTo(0, 5);
    expect(end.mesh.position[1]).toBeCloseTo(0, 5);

    expect(start.mesh.rotation).toEqual([0, 0, 0]);
    expect(end.mesh.rotation).toEqual([0, 0, 0]);
    expect(start.camera.position).toEqual(end.camera.position);
  });
});

describe("computeScreenInlay", () => {
  it("cover: fills the display and crops a wide image horizontally", () => {
    const layout = computeScreenInlay(
      { width: 1920, height: 1080 },
      DEVICE_FRAME,
      "cover",
    );
    const innerWidth = DEVICE_FRAME.frameWidth - 2 * DEVICE_FRAME.bezel;
    const innerHeight = DEVICE_FRAME.frameHeight - 2 * DEVICE_FRAME.bezel;
    expect(layout.width).toBeCloseTo(innerWidth, 5);
    expect(layout.height).toBeCloseTo(innerHeight, 5);
    expect(layout.uvScale[0]).toBeLessThan(1);
    expect(layout.uvScale[1]).toBeCloseTo(1, 5);
    expect(layout.uvOffset[0]).toBeCloseTo((1 - layout.uvScale[0]) / 2, 5);
  });

  it("cover: crops a very tall image vertically", () => {
    const layout = computeScreenInlay(
      { width: 1080, height: 3200 },
      DEVICE_FRAME,
      "cover",
    );
    expect(layout.uvScale[0]).toBeCloseTo(1, 5);
    expect(layout.uvScale[1]).toBeLessThan(1);
  });

  it("contain: shrinks the plane to the image aspect and skips UV crop", () => {
    const layout = computeScreenInlay(
      { width: 1920, height: 1080 },
      DEVICE_FRAME,
      "contain",
    );
    const innerWidth = DEVICE_FRAME.frameWidth - 2 * DEVICE_FRAME.bezel;
    const innerHeight = DEVICE_FRAME.frameHeight - 2 * DEVICE_FRAME.bezel;
    expect(layout.width).toBeCloseTo(innerWidth, 5);
    expect(layout.height).toBeLessThan(innerHeight);
    expect(layout.uvScale).toEqual([1, 1]);
    expect(layout.uvOffset).toEqual([0, 0]);
  });
});
