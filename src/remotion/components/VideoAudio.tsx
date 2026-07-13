import React from "react";
import { Audio, Sequence } from "remotion";
import {
  DEFAULT_BACKGROUND_MUSIC_URL,
  DEFAULT_TRANSITION_SFX_URL,
} from "../constants/media";
import { getSlideStartFrames } from "../lib/slide-timing";

interface VideoAudioProps {
  readonly durationInFrames: number;
  readonly slideCount: number;
  readonly introDurationFrames: number;
  readonly backgroundMusicUrl?: string;
  readonly transitionSfxUrl?: string;
  readonly enableAudio: boolean;
}

export const VideoAudio: React.FC<VideoAudioProps> = ({
  durationInFrames,
  slideCount,
  introDurationFrames,
  backgroundMusicUrl = DEFAULT_BACKGROUND_MUSIC_URL,
  transitionSfxUrl = DEFAULT_TRANSITION_SFX_URL,
  enableAudio,
}) => {
  if (!enableAudio) {
    return null;
  }

  const contentDuration = Math.max(1, durationInFrames - introDurationFrames);
  const slideStarts = getSlideStartFrames(contentDuration, slideCount).map(
    (start) => start + introDurationFrames,
  );

  return (
    <>
      <Audio src={backgroundMusicUrl} volume={0.22} loop />
      {slideStarts.slice(1).map((startFrame, index) => (
        <Sequence key={startFrame} from={startFrame} durationInFrames={24}>
          <Audio src={transitionSfxUrl} volume={0.35} />
        </Sequence>
      ))}
    </>
  );
};
