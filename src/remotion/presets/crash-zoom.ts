import { Easing, interpolate } from "remotion";
import type { PresetComputeFn, Vec3 } from "../types/screenshot-video";
import { interpolateVec3 } from "./shared";

// Hyper-aggressive Crash Zoom (very fast, extreme easing)
const SNAP_EASING = Easing.bezier(0.85, 0, 0.15, 1);

const START_CAM_Z = 9.0; // Starts further back
const ZOOM_CAM_Z = 3.0;  // Zooms in closer

const START_ROTATION: Vec3 = [0.45, -0.6, 0.1];
const END_ROTATION: Vec3 = [0, 0, 0];

const WORLD_WIDTH = 6.0;
const WORLD_HEIGHT = 4.5;

export const computeCrashZoomStyle: PresetComputeFn = ({
  frame,
  durationInFrames,
}) => {
  // Snap zoom takes ~25 frames (very fast)
  const snapDuration = Math.min(25, durationInFrames * 0.2);
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
