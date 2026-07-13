export function getSlideTiming(
  frame: number,
  durationInFrames: number,
  slideCount: number,
): {
  slideIndex: number;
  localFrame: number;
  localDuration: number;
  slideStartFrame: number;
} {
  const framesPerSlide = Math.max(1, Math.floor(durationInFrames / slideCount));
  const slideIndex = Math.min(slideCount - 1, Math.floor(frame / framesPerSlide));
  const slideStartFrame = slideIndex * framesPerSlide;
  const localFrame = frame - slideStartFrame;
  const localDuration =
    slideIndex === slideCount - 1
      ? durationInFrames - slideStartFrame
      : framesPerSlide;

  return { slideIndex, localFrame, localDuration, slideStartFrame };
}

export function getSlideStartFrames(
  durationInFrames: number,
  slideCount: number,
): number[] {
  const framesPerSlide = Math.max(1, Math.floor(durationInFrames / slideCount));
  return Array.from({ length: slideCount }, (_, index) => index * framesPerSlide);
}
