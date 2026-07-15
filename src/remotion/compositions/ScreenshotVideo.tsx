import { PerspectiveCamera } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import React, { Fragment, useMemo } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { BACKGROUND_CSS } from "../art-direction/catalog";
import { ProductIntro } from "../components/ProductIntro";
import { SceneSlide } from "../components/SceneSlide";
import { VideoAudio } from "../components/VideoAudio";
import { INTRO_DURATION_FRAMES } from "../constants/media";
import { getSceneSequenceDuration } from "../lib/slide-timing";
import {
  DEFAULT_LOGO_INTRO_BACKDROP,
  DEFAULT_LOGO_INTRO_MOTION,
} from "../motion-skills/ids";
import {
  DEFAULT_SVG_ACCENT,
  DEFAULT_SVG_MOTION,
} from "../motion-skills/svg/ids";
import {
  DEFAULT_SCENE_TRANSITION,
  DEFAULT_TRANSITION_DURATION_FRAMES,
  resolveSceneTransitionPresentation,
  resolveSceneTransitionTiming,
  type SceneTransitionId,
} from "../transitions/catalog";
import type { ScreenshotVideoProps } from "../types/screenshot-video";

export const ScreenshotVideo: React.FC<ScreenshotVideoProps> = ({
  scenes,
  presetName,
  durationInFrames,
  enableAudio,
  audioDirection,
  backgroundMusicUrl,
  transitionSfxUrl,
  logoUrl,
  textPreset,
  frameStyle = "window",
  background = "dark-gradient",
  panelStyle,
  introMotion = "scale-in",
  sceneTransition = DEFAULT_SCENE_TRANSITION,
  logoIntroMotion = DEFAULT_LOGO_INTRO_MOTION,
  logoIntroBackdrop = DEFAULT_LOGO_INTRO_BACKDROP,
  svgMotion = DEFAULT_SVG_MOTION,
  svgAccent = DEFAULT_SVG_ACCENT,
}) => {
  const { fps } = useVideoConfig();

  const safeScenes = scenes.length > 0 ? scenes : [
    {
      screenshotUrl: "",
      headline: "",
      subline: "",
    },
  ];

  const introDuration = logoUrl ? INTRO_DURATION_FRAMES : 0;
  const contentDuration = Math.max(1, durationInFrames - introDuration);
  const sceneSequenceDuration = useMemo(
    () => getSceneSequenceDuration(contentDuration, safeScenes.length),
    [contentDuration, safeScenes.length],
  );

  const transitionPresentation = useMemo(
    () => resolveSceneTransitionPresentation(sceneTransition as SceneTransitionId),
    [sceneTransition],
  );
  const transitionTiming = useMemo(
    () => resolveSceneTransitionTiming(sceneTransition as SceneTransitionId),
    [sceneTransition],
  );

  const backgroundStyle = BACKGROUND_CSS[background];

  return (
    <AbsoluteFill style={{ background: backgroundStyle }}>
      <VideoAudio
        durationInFrames={durationInFrames}
        slideCount={safeScenes.length}
        introDurationFrames={introDuration}
        enableAudio={enableAudio}
        audioDirection={audioDirection}
        backgroundMusicUrl={backgroundMusicUrl}
        transitionSfxUrl={transitionSfxUrl}
        fps={fps}
        transitionDurationFrames={DEFAULT_TRANSITION_DURATION_FRAMES}
      />

      {introDuration > 0 && (
        <Sequence from={0} durationInFrames={introDuration}>
          <ProductIntro
            logoUrl={logoUrl}
            logoIntroMotion={logoIntroMotion}
            logoIntroBackdrop={logoIntroBackdrop}
            svgMotion={svgMotion}
            svgAccent={svgAccent}
          />
        </Sequence>
      )}

      <Sequence from={introDuration} durationInFrames={contentDuration}>
        {safeScenes.length === 1 ? (
          <SceneSlide
            scene={safeScenes[0]}
            durationInFrames={contentDuration}
            presetName={presetName}
            frameStyle={frameStyle}
            background={background}
            panelStyle={panelStyle}
            introMotion={introMotion}
            textPreset={textPreset}
          />
        ) : (
          <TransitionSeries>
            {safeScenes.map((scene, index) => (
              <Fragment key={`${scene.screenshotUrl}-${index}`}>
                <TransitionSeries.Sequence durationInFrames={sceneSequenceDuration}>
                  <SceneSlide
                    scene={scene}
                    durationInFrames={sceneSequenceDuration}
                    presetName={presetName}
                    frameStyle={frameStyle}
                    background={background}
                    panelStyle={panelStyle}
                    introMotion={introMotion}
                    textPreset={textPreset}
                  />
                </TransitionSeries.Sequence>
                {index < safeScenes.length - 1 && (
                  <TransitionSeries.Transition
                    presentation={transitionPresentation}
                    timing={transitionTiming}
                  />
                )}
              </Fragment>
            ))}
          </TransitionSeries>
        )}
      </Sequence>
    </AbsoluteFill>
  );
};
