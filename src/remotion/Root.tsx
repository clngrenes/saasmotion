import React from "react";
import { Composition } from "remotion";
import { ScreenshotVideo } from "./compositions/ScreenshotVideo";
import {
  DEFAULT_BACKGROUND_MUSIC_URL,
  DEFAULT_TRANSITION_SFX_URL,
} from "./constants/media";
import { screenshotVideoSchema } from "./schemas/screenshot-video-schema";
import type { ScreenshotVideoProps } from "./types/screenshot-video";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const DEFAULT_DURATION_IN_FRAMES = 150;

const defaultProps = {
  scenes: [
    {
      screenshotUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=1950&fit=crop",
      headline: "Ship cinematic demos",
      subline: "From screenshots to product videos in minutes",
    },
  ],
  productName: "SaaMotion",
  tagline: "Cinematic 3D videos from your app screenshots",
  presetName: "zelios-style" as const,
  durationInFrames: DEFAULT_DURATION_IN_FRAMES,
  backgroundMusicUrl: DEFAULT_BACKGROUND_MUSIC_URL,
  transitionSfxUrl: DEFAULT_TRANSITION_SFX_URL,
  enableAudio: true,
} satisfies ScreenshotVideoProps;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ScreenshotVideo"
      component={ScreenshotVideo}
      schema={screenshotVideoSchema}
      defaultProps={defaultProps}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      durationInFrames={DEFAULT_DURATION_IN_FRAMES}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.durationInFrames,
      })}
    />
  );
};
