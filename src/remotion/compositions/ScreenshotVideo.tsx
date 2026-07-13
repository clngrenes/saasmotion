import { PerspectiveCamera } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
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

export const ScreenshotVideo: React.FC<ScreenshotVideoProps> = ({
  screenshotUrl,
  presetName,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Alle Bewegungen leiten sich deterministisch aus dem Frame ab (kein useFrame).
  const { camera, mesh } = computePresetFrame(presetName, {
    frame,
    durationInFrames,
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
            screenshotUrl={screenshotUrl}
            position={mesh.position}
            rotation={mesh.rotation}
          />
        </SuspenseLoader>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
