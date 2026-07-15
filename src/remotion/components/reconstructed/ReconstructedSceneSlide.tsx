import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BACKGROUND_CSS } from "../../art-direction/catalog";
import type { IntroMotionId, PanelVisualStyle } from "../../art-direction/catalog";
import type { BackgroundStyleId } from "../../art-direction/catalog";
import type { TextPresetId } from "../../text-presets/catalog";
import type { CameraPresetName, FrameStyleId, VideoScene } from "../../types/screenshot-video";
import type { UIElement } from "../../../types/ui-reconstruction";
import { applyIntroMotion, getIntroOpacity } from "../../art-direction/intro-motion";
import { computeSceneTypographyLayout } from "../../lib/scene-layout";
import { SceneHeadline } from "../SceneHeadline";
import { ReconstructedUIRoot } from "./ReconstructedUIRoot";

function findElement(node: UIElement, id: string): UIElement | null {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findElement(child, id);
    if (found) return found;
  }
  return null;
}

interface ReconstructedSceneSlideProps {
  readonly scene: VideoScene;
  readonly durationInFrames: number;
  readonly presetName: CameraPresetName;
  readonly frameStyle: FrameStyleId;
  readonly background: BackgroundStyleId;
  readonly panelStyle?: PanelVisualStyle;
  readonly introMotion: IntroMotionId;
  readonly textPreset: TextPresetId;
}

export const ReconstructedSceneSlide: React.FC<ReconstructedSceneSlideProps> = ({
  scene,
  durationInFrames,
  presetName,
  frameStyle,
  background,
  panelStyle,
  introMotion,
  textPreset,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const backgroundStyle = BACKGROUND_CSS[background];
  const layout = computeSceneTypographyLayout(width, height, background);

  const uiTree = scene.uiTree!;
  const focusId = scene.focusElementId ?? uiTree.focusableIds[0];

  const focusElement = useMemo(
    () => (focusId ? findElement(uiTree.root, focusId) : null),
    [focusId, uiTree.root],
  );

  const isPhone = frameStyle === "phone";
  const screenAspect = uiTree.width / uiTree.height;
  const maxScreenHeight = height * (isPhone ? layout.maxUiHeightRatio * 0.95 : layout.maxUiHeightRatio);
  const maxScreenWidth = width * (isPhone ? Math.min(0.48, layout.maxUiWidthRatio) : layout.maxUiWidthRatio);
  let screenW = maxScreenWidth;
  let screenH = screenW / screenAspect;
  if (screenH > maxScreenHeight) {
    screenH = maxScreenHeight;
    screenW = screenH * screenAspect;
  }

  // Nudge UI away from the text band so whip-zoom never covers copy
  const textBandPx = height * layout.textBandRatio;
  const uiBandOffsetY =
    layout.textPlacement === "bottom"
      ? -textBandPx * 0.22
      : textBandPx * 0.18;

  const bezel = isPhone ? 14 : 8;
  const frameW = screenW + bezel * 2;
  const frameH = screenH + bezel * 2;
  const cornerRadius = isPhone ? 36 : panelStyle?.cornerRadius === "high" ? 16 : 12;

  // Critical Damping Spring Physics for snap zooms
  // 14 damping and 120 stiffness ensures it snaps precisely into focus without wobbling
  const snapProgress = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 1,
    },
  });

  let targetScale = 1;
  let targetX = 0;
  let targetY = 0;

  if (focusElement && presetName === "crash-zoom") {
    const cx = focusElement.bounds.x + focusElement.bounds.width / 2;
    const cy = focusElement.bounds.y + focusElement.bounds.height / 2;
    targetScale = 1.35;
    targetX = (50 - cx) * 0.012 * screenW;
    targetY = (50 - cy) * 0.012 * screenH;
  } else if (focusElement && presetName === "linear-style") {
    const cx = focusElement.bounds.x + focusElement.bounds.width / 2;
    const cy = focusElement.bounds.y + focusElement.bounds.height / 2;
    targetScale = 1.28;
    targetX = (50 - cx) * 0.01 * screenW;
    targetY = (50 - cy) * 0.01 * screenH;
  } else if (focusElement) {
    const cx = focusElement.bounds.x + focusElement.bounds.width / 2;
    const cy = focusElement.bounds.y + focusElement.bounds.height / 2;
    targetScale = 1.12;
    targetX = (50 - cx) * 0.007 * screenW;
    targetY = (50 - cy) * 0.007 * screenH;
  }

  const scale = interpolate(snapProgress, [0, 1], [1, targetScale]);
  const translateX = interpolate(snapProgress, [0, 1], [0, targetX]);
  const translateY = interpolate(snapProgress, [0, 1], [0, targetY]);

  const introOpacity = getIntroOpacity(introMotion, frame);
  const introMesh = applyIntroMotion(
    { position: [0, 0, 0], rotation: [0, 0, 0] },
    introMotion,
    frame,
  );
  const introScale = 1 + introMesh.position[2] * 0.02;

  return (
    <AbsoluteFill style={{ background: backgroundStyle }}>
      {panelStyle?.backgroundBlur && (
        <AbsoluteFill
          style={{
            background: backgroundStyle,
            filter: "blur(28px)",
            opacity: 0.45,
            transform: "scale(1.08)",
          }}
        />
      )}

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: introOpacity,
          transform: `translateY(${uiBandOffsetY}px) scale(${introScale})`,
        }}
      >
        <div
          style={{
            width: frameW,
            height: frameH,
            borderRadius: cornerRadius,
            background: isPhone ? "#0e0e11" : panelStyle?.stroke ? "rgba(255,255,255,0.06)" : "#111",
            border: panelStyle?.stroke ? "1px solid rgba(255,255,255,0.12)" : undefined,
            boxShadow: panelStyle?.dropShadow
              ? "0 24px 80px rgba(0,0,0,0.45)"
              : "0 16px 48px rgba(0,0,0,0.35)",
            padding: bezel,
            boxSizing: "border-box",
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            style={{
              width: screenW,
              height: screenH,
              borderRadius: isPhone ? 24 : cornerRadius - 4,
              overflow: "hidden",
              backgroundColor: uiTree.backgroundColor,
              position: "relative",
            }}
          >
            <ReconstructedUIRoot
              element={uiTree.root}
              focusElementId={focusId}
              localDuration={durationInFrames}
            />
          </div>
        </div>
      </AbsoluteFill>

      <SceneHeadline
        headline={scene.headline}
        subline={scene.subline}
        localFrame={frame}
        localDuration={durationInFrames}
        textPreset={textPreset}
        background={background}
      />
    </AbsoluteFill>
  );
};
