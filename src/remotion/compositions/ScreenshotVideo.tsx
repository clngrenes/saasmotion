import { PerspectiveCamera } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DeviceFrameMesh } from "../components/DeviceFrameMesh";
import { SuspenseLoader } from "../components/SuspenseLoader";
import {
  computePresetFrame,
  PRESET_CAMERA_CONFIG,
  toMutableTuple,
} from "../presets";
import type { ScreenshotVideoProps } from "../types/screenshot-video";

const BACKGROUND =
  "radial-gradient(120% 120% at 50% 20%, #1b2233 0%, #0a0d15 58%, #05060a 100%)";

function getSlideTiming(
  frame: number,
  durationInFrames: number,
  slideCount: number,
): {
  slideIndex: number;
  localFrame: number;
  localDuration: number;
} {
  const framesPerSlide = Math.max(1, Math.floor(durationInFrames / slideCount));
  const slideIndex = Math.min(slideCount - 1, Math.floor(frame / framesPerSlide));
  const localFrame = frame - slideIndex * framesPerSlide;
  const localDuration =
    slideIndex === slideCount - 1
      ? durationInFrames - slideIndex * framesPerSlide
      : framesPerSlide;

  return { slideIndex, localFrame, localDuration };
}

export const ScreenshotVideo: React.FC<ScreenshotVideoProps> = ({
  screenshotUrls,
  presetName,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const urls = screenshotUrls.length > 0 ? screenshotUrls : [""];
  const { slideIndex, localFrame, localDuration } = useMemo(
    () => getSlideTiming(frame, durationInFrames, urls.length),
    [frame, durationInFrames, urls.length],
  );
  const activeScreenshotUrl = urls[slideIndex] ?? urls[0];

  const { camera, mesh } = computePresetFrame(presetName, {
    frame: localFrame,
    durationInFrames: localDuration,
    fps,
  });
  const { fov } = PRESET_CAMERA_CONFIG[presetName];

  return (
    <AbsoluteFill style={{ background: BACKGROUND }}>
      <ThreeCanvas
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
        gl={{ antialias: true }}
      >
        <PerspectiveCamera
          makeDefault
          fov={fov}
          position={toMutableTuple(camera.position)}
          rotation={toMutableTuple(camera.rotation)}
        />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 6]} intensity={1.1} />
        <SuspenseLoader>
          <DeviceFrameMesh
            key={activeScreenshotUrl}
            screenshotUrl={activeScreenshotUrl}
            position={mesh.position}
            rotation={mesh.rotation}
          />
        </SuspenseLoader>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
