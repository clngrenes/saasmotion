import { PerspectiveCamera } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { BACKGROUND_CSS } from "../art-direction/catalog";
import { applyIntroMotion, getIntroOpacity } from "../art-direction/intro-motion";
import { DeviceFrameMesh } from "../components/DeviceFrameMesh";
import { WindowFrameMesh } from "../components/WindowFrameMesh";
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

export const ScreenshotVideo: React.FC<ScreenshotVideoProps> = ({
  scenes,
  productName,
  tagline,
  presetName,
  durationInFrames,
  enableAudio,
  audioDirection,
  logoUrl,
  textPreset,
  frameStyle = "window",
  background = "dark-gradient",
  panelStyle,
  introMotion = "scale-in",
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

  const baseMesh = computePresetFrame(presetName, {
    frame: localFrame,
    durationInFrames: localDuration,
    fps,
  }).mesh;

  const mesh = applyIntroMotion(baseMesh, introMotion, localFrame);
  const meshOpacity = getIntroOpacity(introMotion, localFrame);
  const { fov } = PRESET_CAMERA_CONFIG[presetName];
  const camera = computePresetFrame(presetName, {
    frame: localFrame,
    durationInFrames: localDuration,
    fps,
  }).camera;

  const backgroundStyle = BACKGROUND_CSS[background];

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

      <VideoAudio
        durationInFrames={durationInFrames}
        slideCount={safeScenes.length}
        introDurationFrames={INTRO_DURATION_FRAMES}
        enableAudio={enableAudio}
        audioDirection={audioDirection}
        fps={fps}
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
              {frameStyle === "window" && panelStyle ? (
                <WindowFrameMesh
                  key={activeScene.screenshotUrl}
                  screenshotUrl={activeScene.screenshotUrl}
                  position={mesh.position}
                  rotation={mesh.rotation}
                  panelStyle={panelStyle}
                  opacity={meshOpacity}
                />
              ) : (
                <DeviceFrameMesh
                  key={activeScene.screenshotUrl}
                  screenshotUrl={activeScene.screenshotUrl}
                  position={mesh.position}
                  rotation={mesh.rotation}
                />
              )}
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
