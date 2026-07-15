import { useTexture } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";
import { computeScreenInlay, DEVICE_FRAME, toMutableTuple } from "../presets";
import type { Vec3 } from "../types/screenshot-video";
import type { BoundingBox } from "../../types/video-script";
import { UIHighlightLayer } from "./UIHighlightLayer";

/** Dunkles, leicht metallisches Gehäuse */
const BODY_COLOR = "#0e0e11";
/** Das Display liegt minimal vor der Gehäuse-Ebene, um Z-Fighting zu vermeiden */
const SCREEN_Z_OFFSET = 0.02;

/** Zentrierter, abgerundeter Rechteck-Umriss für das Gerätegehäuse */
function createRoundedRectShape(
  width: number,
  height: number,
  radius: number,
): THREE.Shape {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const r = Math.min(radius, halfWidth, halfHeight);

  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + r, -halfHeight);
  shape.lineTo(halfWidth - r, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + r);
  shape.lineTo(halfWidth, halfHeight - r);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - r, halfHeight);
  shape.lineTo(-halfWidth + r, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - r);
  shape.lineTo(-halfWidth, -halfHeight + r);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + r, -halfHeight);
  return shape;
}

interface DeviceFrameMeshProps {
  readonly screenshotUrl: string;
  readonly position: Vec3;
  readonly rotation: Vec3;
  readonly highlightBox?: BoundingBox;
}

export const DeviceFrameMesh: React.FC<DeviceFrameMeshProps> = ({
  screenshotUrl,
  position,
  rotation,
  highlightBox,
}) => {
  // Suspendet bis die Textur geladen ist; von <SuspenseLoader> abgefangen.
  const texture = useTexture(screenshotUrl);

  const inlay = useMemo(() => {
    const image = texture.image as { width: number; height: number };
    return computeScreenInlay(
      { width: image.width, height: image.height },
      DEVICE_FRAME,
      "cover",
    );
  }, [texture]);

  const screenTexture = useMemo(() => {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(inlay.uvScale[0], inlay.uvScale[1]);
    texture.offset.set(inlay.uvOffset[0], inlay.uvOffset[1]);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture, inlay]);

  const bodyShape = useMemo(
    () =>
      createRoundedRectShape(
        DEVICE_FRAME.frameWidth,
        DEVICE_FRAME.frameHeight,
        DEVICE_FRAME.cornerRadius,
      ),
    [],
  );

  return (
    <group position={toMutableTuple(position)} rotation={toMutableTuple(rotation)}>
      <mesh>
        <shapeGeometry args={[bodyShape]} />
        <meshStandardMaterial
          color={BODY_COLOR}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[inlay.offsetX, inlay.offsetY, SCREEN_Z_OFFSET]}>
        <planeGeometry args={[inlay.width, inlay.height]} />
        <meshBasicMaterial map={screenTexture} toneMapped={false} />
      </mesh>

      {/* Sliced 3D Highlight Layer */}
      {highlightBox && (
        <group position={[0, 0, SCREEN_Z_OFFSET]}>
          <UIHighlightLayer
            textureUrl={screenshotUrl}
            highlightBox={highlightBox}
            inlay={inlay}
          />
        </group>
      )}
    </group>
  );
};
