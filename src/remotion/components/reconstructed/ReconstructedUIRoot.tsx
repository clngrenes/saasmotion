import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { UIElement } from "../../../types/ui-reconstruction";

interface ReconstructedUIRootProps {
  readonly element: UIElement;
  readonly focusElementId?: string;
  readonly localDuration: number;
}

function elementStyle(
  element: UIElement,
  focusElementId: string | undefined,
  focusProgress: number,
): React.CSSProperties {
  const isFocused = focusElementId === element.id;
  const focusScale = isFocused ? 1 + focusProgress * 0.04 : 1;
  const focusLift = isFocused ? -focusProgress * 6 : 0;
  const focusShadow = isFocused
    ? `0 ${8 + focusProgress * 12}px ${24 + focusProgress * 16}px rgba(0,0,0,${0.25 + focusProgress * 0.15})`
    : element.type === "card"
      ? "0 2px 12px rgba(0,0,0,0.2)"
      : undefined;

  return {
    position: "absolute",
    left: `${element.bounds.x}%`,
    top: `${element.bounds.y}%`,
    width: `${element.bounds.width}%`,
    height: `${element.bounds.height}%`,
    backgroundColor: element.style?.backgroundColor,
    color: element.style?.color,
    fontSize: element.style?.fontSize,
    fontWeight: element.style?.fontWeight,
    borderRadius: element.style?.borderRadius,
    opacity: element.style?.opacity ?? 1,
    border:
      element.style?.borderWidth && element.style?.borderColor
        ? `${element.style.borderWidth}px solid ${element.style.borderColor}`
        : undefined,
    overflow: "hidden",
    display: "flex",
    alignItems: element.type === "text" ? "flex-start" : "center",
    justifyContent: element.type === "text" ? "flex-start" : "center",
    boxSizing: "border-box",
    transform: `scale(${focusScale}) translateY(${focusLift}px)`,
    boxShadow: focusShadow,
    zIndex: isFocused ? 10 : element.type === "card" ? 2 : 1,
    transition: "none",
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    lineHeight: 1.2,
    padding: element.type === "text" ? "2px 4px" : undefined,
    whiteSpace: element.type === "text" ? "pre-wrap" : undefined,
  };
}

function renderElement(
  element: UIElement,
  focusElementId: string | undefined,
  focusProgress: number,
): React.ReactNode {
  const style = elementStyle(element, focusElementId, focusProgress);

  if (element.type === "progress") {
    const fill = element.content ?? "50";
    const pct = Math.min(100, Math.max(0, Number.parseFloat(fill) || 50));
    return (
      <div key={element.id} style={style}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: element.style?.color ?? "#8b5cf6",
            borderRadius: element.style?.borderRadius ?? 4,
          }}
        />
      </div>
    );
  }

  return (
    <div key={element.id} style={style}>
      {element.content && element.type !== "container" && (
        <span style={{ width: "100%", textAlign: "inherit" }}>{element.content}</span>
      )}
      {element.children?.map((child) =>
        renderElement(child, focusElementId, focusProgress),
      )}
    </div>
  );
}

export const ReconstructedUIRoot: React.FC<ReconstructedUIRootProps> = ({
  element,
  focusElementId,
  localDuration,
}) => {
  const frame = useCurrentFrame();

  const focusProgress = interpolate(
    frame,
    [12, Math.min(36, localDuration * 0.25)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {renderElement(element, focusElementId, focusProgress)}
    </div>
  );
};
