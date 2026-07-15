import { Easing, interpolate } from "remotion";
import type { PresetComputeFn, Vec3 } from "../types/screenshot-video";
import { interpolateVec3 } from "./shared";

// Extreme ease-out for snappy zoom (typical Linear/Apple pop)
const SNAP_EASING = Easing.bezier(0.16, 1, 0.3, 1);

const START_CAM_Z = 7.0;
const ZOOM_CAM_Z = 3.6;

const START_ROTATION: Vec3 = [0.35, -0.4, 0.05];
const END_ROTATION: Vec3 = [0, 0, 0];

const WORLD_WIDTH = 6.0;
const WORLD_HEIGHT = 4.5;

export const computeLinearStyle: PresetComputeFn = ({
  frame,
  durationInFrames,
  highlightBox,
}) => {
  // Snap zoom takes ~45 frames (1.5 seconds)
  const snapDuration = Math.min(45, durationInFrames * 0.3);
  const snapProgress = interpolate(frame, [0, snapDuration], [0, 1], {
    easing: SNAP_EASING,
    extrapolateRight: "clamp",
  });

  const driftProgress = interpolate(frame, [snapDuration, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let targetMeshX = 0;
  let targetMeshY = 0;

  if (highlightBox) {
    // Determine the center of the highlight relative to the UI layout
    const fx = highlightBox.x / 100;
    const fy = highlightBox.y / 100;
    const fw = highlightBox.width / 100;
    const fh = highlightBox.height / 100;

    const hCenterX = fx + fw / 2;
    const hCenterY = fy + fh / 2;

    // Move the mesh in the OPPOSITE direction of the highlight to center it.
    // However, if we move it dead center, it crashes into the SceneHeadline text.
    // So we add an offset to targetMeshY so the highlight stays slightly lower
    // in the frame, leaving room for text at the top.
    targetMeshX = -(hCenterX - 0.5) * WORLD_WIDTH * 0.65;
    targetMeshY = (hCenterY - 0.5) * WORLD_HEIGHT * 0.65 - 0.8;
  }

  // Calculate current positions
  const currentRot = interpolateVec3(snapProgress, [0, 1], START_ROTATION, END_ROTATION, (t) => t);
  const currentMeshX = interpolate(snapProgress, [0, 1], [0, targetMeshX]);
  const currentMeshY = interpolate(snapProgress, [0, 1], [0, targetMeshY]);
  const currentCamZ = interpolate(snapProgress, [0, 1], [START_CAM_Z, ZOOM_CAM_Z]);

  // Subtle drift after the snap
  const driftX = interpolate(driftProgress, [0, 1], [0, -0.15]);
  const driftZ = interpolate(driftProgress, [0, 1], [0, -0.4]);

  return {
    camera: {
      position: [0, 0, currentCamZ + driftZ],
      rotation: [0, 0, 0],
    },
    mesh: {
      position: [currentMeshX + driftX, currentMeshY, 0],
      rotation: currentRot,
    },
  };
};
