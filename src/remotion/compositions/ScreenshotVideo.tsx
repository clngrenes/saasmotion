import { PerspectiveCamera } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { DeviceFrameMesh } from "../components/DeviceFrameMesh";
import { ProductIntro } from "../components/ProductIntro";
import { SceneHeadline } from "../components/SceneHeadline";
import { SuspenseLoader } from "../components/SuspenseLoader";
import { VideoAudio } from "../components/VideoAudio";
import { INTRO_DURATION_FRAMES } from "../constants/media";
import { getSlideTiming } from "../lib/slide-timing";
import {
  computePresetFrame,
  PRESET_CAMERA_CONFIG,
  toMutableTuple,
} from "../presets";
import type { ScreenshotVideoProps } from "../types/screenshot-video";

const BACKGROUND =
  "radial-gradient(120% 120% at 50% 20%, #1b2233 0%, #0a0d15 58%, #05060a 100%)";

export const ScreenshotVideo: React.FC<ScreenshotVideoProps> = ({
  scenes,
  productName,
  tagline,
  presetName,
  durationInFrames,
  backgroundMusicUrl,
  transitionSfxUrl,
  enableAudio,
  logoUrl,
  textPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const safeScenes = scenes.length > 0 ? scenes : [
    {
      screenshotUrl: "",
      headline: "",
      subline: "",
    },
  ];

  const contentFrame = Math.max(0, frame - INTRO_DURATION_FRAMES);
  const contentDuration = Math.max(1, durationInFrames - INTRO_DURATION_FRAMES);
  const showIntro = frame < INTRO_DURATION_FRAMES;

  const { slideIndex, localFrame, localDuration } = useMemo(
    () => getSlideTiming(contentFrame, contentDuration, safeScenes.length),
    [contentFrame, contentDuration, safeScenes.length],
  );

  const activeScene = safeScenes[slideIndex] ?? safeScenes[0];

  const { camera, mesh } = computePresetFrame(presetName, {
    frame: localFrame,
    durationInFrames: localDuration,
    fps,
  });
  const { fov } = PRESET_CAMERA_CONFIG[presetName];

  return (
    <AbsoluteFill style={{ background: BACKGROUND }}>
      <VideoAudio
        durationInFrames={durationInFrames}
        slideCount={safeScenes.length}
        introDurationFrames={INTRO_DURATION_FRAMES}
        backgroundMusicUrl={backgroundMusicUrl}
        transitionSfxUrl={transitionSfxUrl}
        enableAudio={enableAudio}
      />

      <Sequence from={0} durationInFrames={INTRO_DURATION_FRAMES}>
        <ProductIntro productName={productName} tagline={tagline} logoUrl={logoUrl} />
      </Sequence>

      {!showIntro && (
        <>
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
                key={activeScene.screenshotUrl}
                screenshotUrl={activeScene.screenshotUrl}
                position={mesh.position}
                rotation={mesh.rotation}
              />
            </SuspenseLoader>
          </ThreeCanvas>

          <SceneHeadline
            headline={activeScene.headline}
            subline={activeScene.subline}
            localFrame={localFrame}
            localDuration={localDuration}
            textPreset={textPreset}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
