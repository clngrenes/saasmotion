import React from "react";
import { Easing, interpolate } from "remotion";

interface PillContainerProps {
  readonly children: React.ReactNode;
  readonly progress: number;
  readonly dark?: boolean;
}

const EASE = Easing.out(Easing.cubic);

export const PillContainer: React.FC<PillContainerProps> = ({
  children,
  progress,
  dark = false,
}) => {
  const eased = EASE(progress);

  const opacity = interpolate(eased, [0, 1], [0, 1]);
  const translateY = interpolate(eased, [0, 1], [15, 0]);
  const scale = interpolate(eased, [0, 1], [0.95, 1]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.4em 0.85em",
        borderRadius: "100px",
        backgroundColor: dark ? "rgba(20, 20, 22, 0.95)" : "rgba(255, 255, 255, 0.98)",
        color: dark ? "#ffffff" : "#000000",
        boxShadow: dark
          ? "0 4px 12px rgba(0,0,0,0.3)"
          : "0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        whiteSpace: "nowrap",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};
