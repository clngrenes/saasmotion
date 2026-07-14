import React from "react";
import { Easing, interpolate, spring, useVideoConfig } from "remotion";
import { PillContainer } from "./PillContainer";

interface ChatBubbleStackProps {
  readonly lines: readonly string[];
  readonly localFrame: number;
  readonly staggerFrames?: number;
}

export const ChatBubbleStack: React.FC<ChatBubbleStackProps> = ({
  lines,
  localFrame,
  staggerFrames = 12, // Mehr Abstand zwischen Chat-Zeilen
}) => {
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.5em",
      }}
    >
      {lines.map((line, i) => {
        const startFrame = i * staggerFrames;
        const lineFrame = Math.max(0, localFrame - startFrame);

        const progress = spring({
          fps,
          frame: lineFrame,
          config: {
            damping: 12,
            stiffness: 100,
            mass: 1,
          },
          durationInFrames: 25,
        });

        return (
          <PillContainer key={`${line}-${i}`} progress={progress}>
            {line}
          </PillContainer>
        );
      })}
    </div>
  );
};
