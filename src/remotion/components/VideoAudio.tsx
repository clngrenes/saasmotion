import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import {
  BACKGROUND_MUSIC_FILE,
  TRANSITION_SFX_FILE,
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

function resolveAudioSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return staticFile(src.replace(/^\//, ""));
}

export const VideoAudio: React.FC<VideoAudioProps> = ({
  durationInFrames,
  slideCount,
  introDurationFrames,
  backgroundMusicUrl = BACKGROUND_MUSIC_FILE,
  transitionSfxUrl = TRANSITION_SFX_FILE,
  enableAudio,
}) => {
  if (!enableAudio) {
    return null;
  }

  const contentDuration = Math.max(1, durationInFrames - introDurationFrames);
  const slideStarts = getSlideStartFrames(contentDuration, slideCount).map(
    (start) => start + introDurationFrames,
  );

  const musicSrc = resolveAudioSrc(backgroundMusicUrl);
  const sfxSrc = resolveAudioSrc(transitionSfxUrl);

  return (
    <>
      <Audio src={musicSrc} volume={0.22} loop />
      {slideStarts.slice(1).map((startFrame) => (
        <Sequence key={startFrame} from={startFrame} durationInFrames={24}>
          <Audio src={sfxSrc} volume={0.35} />
        </Sequence>
      ))}
    </>
  );
};
