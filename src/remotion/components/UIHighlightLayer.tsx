import { useTexture } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { BoundingBox } from "../../types/video-script";
import type { ScreenInlayLayout } from "../types/screenshot-video";

interface UIHighlightLayerProps {
  readonly textureUrl: string;
  readonly highlightBox?: BoundingBox;
  readonly inlay: ScreenInlayLayout;
  readonly opacity?: number;
  readonly localDurationInFrames?: number;
}

export const UIHighlightLayer: React.FC<UIHighlightLayerProps> = ({
  textureUrl,
  highlightBox,
  inlay,
  opacity = 1,
  localDurationInFrames = 90,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const texture = useTexture(textureUrl);

  const highlightData = useMemo(() => {
    if (!highlightBox) return null;

    // Convert percentage (0-100) to fraction (0-1)
    const fx = highlightBox.x / 100;
    const fy = highlightBox.y / 100;
    const fw = highlightBox.width / 100;
    const fh = highlightBox.height / 100;

    // Dimensions of the highlight in world units
    const width = inlay.width * fw;
    const height = inlay.height * fh;

    // Center of the highlight relative to the inlay's center
    // Inlay center is 0,0. Top-left is (-inlay.width/2, inlay.height/2).
    const offsetX = -inlay.width / 2 + fx * inlay.width + width / 2;
    const offsetY = inlay.height / 2 - fy * inlay.height - height / 2;

    // UVs for the highlight material
    // We clone the texture to mutate repeat/offset safely
    const t = texture.clone();
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    
    // Scale the UVs
    t.repeat.set(inlay.uvScale[0] * fw, inlay.uvScale[1] * fh);
    
    // Offset the UVs
    // UV origin is bottom-left, so we invert Y logic
    t.offset.set(
      inlay.uvOffset[0] + inlay.uvScale[0] * fx,
      inlay.uvOffset[1] + inlay.uvScale[1] * (1 - fy - fh)
    );
    
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;

    return { width, height, offsetX, offsetY, texture: t };
  }, [highlightBox, inlay, texture]);

  if (!highlightData) return null;

  // Animate the pop-out on the Z axis
  // It starts flat, pops out, and stays there until the transition ends
  const popProgress = interpolate(frame, [10, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3), // cubic ease out
  });
  
  const zOffset = popProgress * 0.18;

  // We construct a soft drop shadow material for the entire frame dimming
  // rather than a harsh black box.
  const dimOpacity = 0.45 * popProgress * opacity;

  return (
    <group position={[highlightData.offsetX, highlightData.offsetY, 0]}>
      {/* Dim the entire background behind the highlight, softer */}
      <mesh position={[-highlightData.offsetX, -highlightData.offsetY, 0.001]} scale={[1, 1, 1]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial color="#000000" transparent opacity={dimOpacity} />
      </mesh>

      {/* The floating highlight plane with rounded edges? PlaneGeometry is sharp.
          Since we can't easily do RoundedBox without a custom shader or shape,
          we rely on the base texture. */}
      <mesh position={[0, 0, zOffset + 0.002]}>
        <planeGeometry args={[highlightData.width, highlightData.height]} />
        <meshBasicMaterial map={highlightData.texture} toneMapped={false} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};
