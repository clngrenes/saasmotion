import { DEFAULT_TRANSITION_DURATION_FRAMES } from "../transitions/ids";

export function getSceneSequenceDuration(
  contentDurationInFrames: number,
  slideCount: number,
  transitionDurationInFrames = DEFAULT_TRANSITION_DURATION_FRAMES,
): number {
  if (slideCount <= 1) return Math.max(1, contentDurationInFrames);

  const overlap = (slideCount - 1) * transitionDurationInFrames;
  return Math.max(
    transitionDurationInFrames + 1,
    Math.floor((contentDurationInFrames + overlap) / slideCount),
  );
}

/** Content-relative frame where each scene transition begins */
export function getTransitionStartFrames(
  contentDurationInFrames: number,
  slideCount: number,
  transitionDurationInFrames = DEFAULT_TRANSITION_DURATION_FRAMES,
): number[] {
  if (slideCount <= 1) return [];

  const sceneDuration = getSceneSequenceDuration(
    contentDurationInFrames,
    slideCount,
    transitionDurationInFrames,
  );

  const starts: number[] = [];
  for (let index = 1; index < slideCount; index += 1) {
    starts.push(index * sceneDuration - index * transitionDurationInFrames);
  }
  return starts;
}

/** @deprecated Use getTransitionStartFrames — kept for legacy callers */
export function getSlideStartFrames(
  durationInFrames: number,
  slideCount: number,
): number[] {
  return getTransitionStartFrames(durationInFrames, slideCount);
}

export function getSlideTiming(
  frame: number,
  durationInFrames: number,
  slideCount: number,
  transitionDurationInFrames = DEFAULT_TRANSITION_DURATION_FRAMES,
): {
  slideIndex: number;
  localFrame: number;
  localDuration: number;
  slideStartFrame: number;
} {
  if (slideCount <= 1) {
    return {
      slideIndex: 0,
      localFrame: frame,
      localDuration: durationInFrames,
      slideStartFrame: 0,
    };
  }

  const sceneDuration = getSceneSequenceDuration(
    durationInFrames,
    slideCount,
    transitionDurationInFrames,
  );
  const step = sceneDuration - transitionDurationInFrames;
  const slideIndex = Math.min(slideCount - 1, Math.floor(frame / step));
  const slideStartFrame = slideIndex * step;
  const localFrame = frame - slideStartFrame;
  const localDuration =
    slideIndex === slideCount - 1
      ? durationInFrames - slideStartFrame
      : sceneDuration;

  return { slideIndex, localFrame, localDuration, slideStartFrame };
}
