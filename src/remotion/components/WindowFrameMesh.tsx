import { useTexture } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";
import { CORNER_RADIUS_UNITS, type PanelVisualStyle } from "../art-direction/catalog";
import { toMutableTuple } from "../presets";
import type { Vec3 } from "../types/screenshot-video";

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

interface WindowFrameMeshProps {
  readonly screenshotUrl: string;
  readonly position: Vec3;
  readonly rotation: Vec3;
  readonly panelStyle: PanelVisualStyle;
  readonly opacity?: number;
}

const MAX_WIDTH = 6.0;
const MAX_HEIGHT = 4.5;
const DEPTH = 0.02;

export const WindowFrameMesh: React.FC<WindowFrameMeshProps> = ({
  screenshotUrl,
  position,
  rotation,
  panelStyle,
  opacity = 1,
}) => {
  const texture = useTexture(screenshotUrl);
  const cornerRadius = CORNER_RADIUS_UNITS[panelStyle.cornerRadius];

  const geometryData = useMemo(() => {
    const img = texture.image as { width: number; height: number };
    const aspect = img.width / Math.max(img.height, 1);

    let w = MAX_WIDTH;
    let h = MAX_WIDTH / aspect;

    if (h > MAX_HEIGHT) {
      h = MAX_HEIGHT;
      w = MAX_HEIGHT * aspect;
    }

    const shape = createRoundedRectShape(w, h, cornerRadius);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
    };

    return { shape, extrudeSettings, w, h };
  }, [texture, cornerRadius]);

  const screenTexture = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  const frameOpacity = panelStyle.panelOpacity * opacity;

  return (
    <group position={toMutableTuple(position)} rotation={toMutableTuple(rotation)}>
      {panelStyle.dropShadow && (
        <mesh position={[0.08, -0.12, -0.15]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[geometryData.w * 0.95, geometryData.h * 0.95]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35 * opacity} />
        </mesh>
      )}

      <mesh position={[0, 0, -DEPTH / 2]}>
        <extrudeGeometry args={[geometryData.shape, geometryData.extrudeSettings]} />
        {panelStyle.glass ? (
          <meshPhysicalMaterial
            color="#f5f5f7"
            roughness={0.12}
            metalness={0.05}
            transmission={0.88}
            thickness={0.4}
            transparent
            opacity={frameOpacity}
          />
        ) : (
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.1}
            metalness={0.1}
            transparent={frameOpacity < 1}
            opacity={frameOpacity}
          />
        )}
      </mesh>

      {panelStyle.stroke && (
        <mesh position={[0, 0, DEPTH / 2 + 0.002]}>
          <shapeGeometry args={[geometryData.shape]} />
          <meshBasicMaterial
            color="#e5e5ea"
            side={THREE.BackSide}
            transparent
            opacity={0.9 * opacity}
          />
        </mesh>
      )}

      <mesh position={[0, 0, DEPTH / 2 + 0.003]}>
        <planeGeometry args={[geometryData.w - 0.02, geometryData.h - 0.02]} />
        <meshBasicMaterial map={screenTexture} toneMapped={false} transparent opacity={opacity} />
      </mesh>
    </group>
  );
};
