import { Easing, interpolate } from "remotion";
import type { IntroMotionId } from "./catalog";
import type { FrameTransform, Vec3 } from "../types/screenshot-video";

const EASE = Easing.out(Easing.cubic);
const INTRO_FRAMES = 24;

function scaleVec3(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

/** Moduliert Mesh-Transform am Anfang jeder Szene basierend auf KI-introMotion */
export function applyIntroMotion(
  transform: FrameTransform,
  introMotion: IntroMotionId,
  localFrame: number,
): FrameTransform {
  if (introMotion === "none" || localFrame >= INTRO_FRAMES) {
    return transform;
  }

  const progress = interpolate(localFrame, [0, INTRO_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  if (introMotion === "fade") {
    return transform;
  }

  if (introMotion === "scale-in") {
    const scale = interpolate(progress, [0, 1], [0.88, 1]);
    return {
      position: scaleVec3(transform.position, scale),
      rotation: transform.rotation,
    };
  }

  if (introMotion === "slide-up") {
    const offsetY = interpolate(progress, [0, 1], [-0.6, 0]);
    return {
      position: [
        transform.position[0],
        transform.position[1] + offsetY,
        transform.position[2],
      ],
      rotation: transform.rotation,
    };
  }

  return transform;
}

export function getIntroOpacity(
  introMotion: IntroMotionId,
  localFrame: number,
): number {
  if (introMotion !== "fade" || localFrame >= INTRO_FRAMES) {
    return 1;
  }

  return interpolate(localFrame, [0, INTRO_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
}
