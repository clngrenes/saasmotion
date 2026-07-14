import React from "react";
import { Easing, interpolate, spring, useVideoConfig } from "remotion";
import { PillContainer } from "./PillContainer";

interface StaggeredWordsProps {
  readonly text: string;
  readonly localFrame: number;
  readonly staggerFrames?: number;
  readonly variant?: "words" | "pills";
}

export const StaggeredWords: React.FC<StaggeredWordsProps> = ({
  text,
  localFrame,
  staggerFrames = 4,
  variant = "words",
}) => {
  const { fps } = useVideoConfig();
  const words = text.split(" ").filter((w) => w.length > 0);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: variant === "pills" ? "0.4em" : "0.25em",
        justifyContent: "center",
      }}
    >
      {words.map((word, i) => {
        const startFrame = i * staggerFrames;
        const wordFrame = Math.max(0, localFrame - startFrame);
        
        // Sanftes Spring-Physics Setup für den "High-Level" Aside Look
        const progress = spring({
          fps,
          frame: wordFrame,
          config: {
            damping: 14,
            stiffness: 120,
            mass: 0.8,
          },
          durationInFrames: 20,
        });

        if (variant === "pills") {
          return (
            <PillContainer key={`${word}-${i}`} progress={progress} dark>
              {word}
            </PillContainer>
          );
        }

        // Einfaches Staggered Word Reveal
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const translateY = interpolate(progress, [0, 1], [10, 0]);

        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${translateY}px)`,
              willChange: "transform, opacity",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
