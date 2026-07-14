import React from "react";
import { Composition } from "remotion";
import { ScreenshotVideo } from "./compositions/ScreenshotVideo";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  getVideoDimensions,
} from "./constants/aspect-ratio";
import {
  DEFAULT_TEXT_PRESET,
} from "./text-presets/catalog";
import {
  DEFAULT_BACKGROUND_MUSIC_URL,
  DEFAULT_TRANSITION_SFX_URL,
} from "./constants/media";
import { screenshotVideoSchema } from "./schemas/screenshot-video-schema";
import type { ScreenshotVideoProps } from "./types/screenshot-video";

const FPS = 30;
const DEFAULT_DURATION_IN_FRAMES = 300;

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
  aspectRatio: DEFAULT_VIDEO_ASPECT_RATIO,
  textPreset: DEFAULT_TEXT_PRESET,
  backgroundMusicUrl: DEFAULT_BACKGROUND_MUSIC_URL,
  transitionSfxUrl: DEFAULT_TRANSITION_SFX_URL,
  enableAudio: true,
} satisfies ScreenshotVideoProps;

export const RemotionRoot: React.FC = () => {
  const { width, height } = getVideoDimensions(DEFAULT_VIDEO_ASPECT_RATIO);

  return (
    <Composition
      id="ScreenshotVideo"
      component={ScreenshotVideo}
      schema={screenshotVideoSchema}
      defaultProps={defaultProps}
      fps={FPS}
      width={width}
      height={height}
      durationInFrames={DEFAULT_DURATION_IN_FRAMES}
      calculateMetadata={({ props }) => {
        const dims = getVideoDimensions(props.aspectRatio);
        return {
          durationInFrames: props.durationInFrames,
          width: dims.width,
          height: dims.height,
        };
      }}
    />
  );
};
