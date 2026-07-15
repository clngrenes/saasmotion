import { PerspectiveCamera } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BACKGROUND_CSS } from "../art-direction/catalog";
import { applyIntroMotion, getIntroOpacity } from "../art-direction/intro-motion";
import type { IntroMotionId, PanelVisualStyle } from "../art-direction/catalog";
import type { BackgroundStyleId } from "../art-direction/catalog";
import type { TextPresetId } from "../text-presets/catalog";
import type { CameraPresetName, FrameStyleId, VideoScene } from "../types/screenshot-video";
import { DeviceFrameMesh } from "./DeviceFrameMesh";
import { WindowFrameMesh } from "./WindowFrameMesh";
import { SceneHeadline } from "./SceneHeadline";
import { SuspenseLoader } from "./SuspenseLoader";
import {
  computePresetFrame,
  PRESET_CAMERA_CONFIG,
  toMutableTuple,
} from "../presets";

type SceneSlideProps = {
  readonly scene: VideoScene;
  readonly durationInFrames: number;
  readonly presetName: CameraPresetName;
  readonly frameStyle: FrameStyleId;
  readonly background: BackgroundStyleId;
  readonly panelStyle?: PanelVisualStyle;
  readonly introMotion: IntroMotionId;
  readonly textPreset: TextPresetId;
};

export const SceneSlide: React.FC<SceneSlideProps> = (props) => {
  // Always render the real screenshot in a device/window mesh.
  // ReconstructedSceneSlide (AI layer tree) is intentionally disabled —
  // low-fidelity reconstructions produced gray placeholder blocks instead of the product UI.
  const {
    scene,
    durationInFrames,
    presetName,
    frameStyle,
    background,
    panelStyle,
    introMotion,
    textPreset,
  } = props;

  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const backgroundStyle = BACKGROUND_CSS[background];

  const baseMesh = computePresetFrame(presetName, {
    frame,
    durationInFrames,
    fps,
  }).mesh;

  const mesh = applyIntroMotion(baseMesh, introMotion, frame);
  const meshOpacity = getIntroOpacity(introMotion, frame);
  const { fov } = PRESET_CAMERA_CONFIG[presetName];
  const camera = computePresetFrame(presetName, {
    frame,
    durationInFrames,
    fps,
  }).camera;

  const cameraProps = useMemo(
    () => ({
      position: toMutableTuple(camera.position),
      rotation: toMutableTuple(camera.rotation),
    }),
    [camera.position, camera.rotation],
  );

  return (
    <AbsoluteFill style={{ background: backgroundStyle }}>
      {panelStyle?.backgroundBlur && (
        <AbsoluteFill
          style={{
            background: backgroundStyle,
            filter: "blur(28px)",
            opacity: 0.45,
            transform: "scale(1.08)",
          }}
        />
      )}

      <ThreeCanvas
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
        gl={{ antialias: true }}
      >
        <PerspectiveCamera makeDefault fov={fov} {...cameraProps} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 6]} intensity={1.1} />
        <SuspenseLoader>
          {frameStyle === "window" && panelStyle ? (
            <WindowFrameMesh
              screenshotUrl={scene.screenshotUrl}
              position={mesh.position}
              rotation={mesh.rotation}
              panelStyle={panelStyle}
              opacity={meshOpacity}
            />
          ) : (
            <DeviceFrameMesh
              screenshotUrl={scene.screenshotUrl}
              position={mesh.position}
              rotation={mesh.rotation}
            />
          )}
        </SuspenseLoader>
      </ThreeCanvas>

      <SceneHeadline
        headline={scene.headline}
        subline={scene.subline}
        localFrame={frame}
        localDuration={durationInFrames}
        textPreset={textPreset}
        background={background}
      />
    </AbsoluteFill>
  );
};
