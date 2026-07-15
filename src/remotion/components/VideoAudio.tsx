import { interpolate, useCurrentFrame } from "remotion";
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
  readonly backgroundMusicUrl?: string;
  readonly transitionSfxUrl?: string;
  readonly fps?: number;
  readonly transitionDurationFrames?: number;
}

function resolveAudioSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return staticFile(src.replace(/^\//, ""));
}

const MusicBed: React.FC<{
  readonly src: string;
  readonly volume: number;
}> = ({ src, volume }) => {
  return (
    <Audio
      src={resolveAudioSrc(src)}
      volume={volume}
      loop
      startFrom={0}
    />
  );
};

export const VideoAudio: React.FC<VideoAudioProps> = ({
  durationInFrames,
  slideCount,
  introDurationFrames,
  enableAudio,
  audioDirection,
  backgroundMusicUrl,
  transitionSfxUrl,
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

  const musicFile =
    backgroundMusicUrl ?? resolveMusicFile(direction.musicStyle) ?? null;
  const sfxFile =
    transitionSfxUrl ?? resolveSfxFile(direction.transitionSfx) ?? null;

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
      {musicFile && direction.musicStyle !== "none" && (
        <MusicBed src={musicFile} volume={direction.musicVolume} />
      )}

      {sfxFile &&
        direction.transitionSfx !== "none" &&
        cues.map((cue) => (
          <Sequence
            key={`${cue.type}-${cue.frame}`}
            from={cue.frame}
            durationInFrames={sfxDuration}
            layout="none"
          >
            <Audio
              src={resolveAudioSrc(sfxFile)}
              volume={direction.sfxVolume}
              startFrom={0}
            />
          </Sequence>
        ))}
    </>
  );
};
