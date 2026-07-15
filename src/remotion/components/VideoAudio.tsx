import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { AudioDirection } from "../constants/audio-catalog";
import {
  DEFAULT_AUDIO_DIRECTION,
  resolveMusicFile,
  resolveSfxFile,
} from "../constants/audio-catalog";
import { getAudioCues, sfxDurationInFrames } from "../lib/audio-timing";

interface VideoAudioProps {
  readonly durationInFrames: number;
  readonly slideCount: number;
  readonly introDurationFrames: number;
  readonly enableAudio: boolean;
  readonly audioDirection?: AudioDirection;
  readonly fps?: number;
  readonly transitionDurationFrames?: number;
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
  enableAudio,
  audioDirection,
  fps = 30,
  transitionDurationFrames,
}) => {
  if (!enableAudio) {
    return null;
  }

  const direction = audioDirection ?? DEFAULT_AUDIO_DIRECTION;

  if (direction.musicStyle === "none" && direction.transitionSfx === "none") {
    return null;
  }

  const musicFile = resolveMusicFile(direction.musicStyle);
  const sfxFile = resolveSfxFile(direction.transitionSfx);
  const cues = getAudioCues({
    durationInFrames,
    slideCount,
    introDurationFrames,
    playIntroRevealSfx: direction.playIntroRevealSfx,
    transitionSfx: direction.transitionSfx,
    fps,
    transitionDurationFrames,
  });

  const sfxDuration = sfxDurationInFrames(direction.transitionSfx, fps);

  return (
    <>
      {musicFile && (
        <Audio
          src={resolveAudioSrc(musicFile)}
          volume={direction.musicVolume}
          loop
        />
      )}

      {sfxFile &&
        cues.map((cue) => (
          <Sequence
            key={`${cue.type}-${cue.frame}`}
            from={cue.frame}
            durationInFrames={sfxDuration}
            layout="none"
          >
            <Audio src={resolveAudioSrc(sfxFile)} volume={direction.sfxVolume} />
          </Sequence>
        ))}
    </>
  );
};
