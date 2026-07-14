import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";

interface KineticTimelineProps {
  readonly headline: string;
  readonly subline: string;
  readonly localFrame: number;
}

export const KineticTimeline: React.FC<KineticTimelineProps> = ({
  headline,
  subline,
  localFrame,
}) => {
  const { fps } = useVideoConfig();

  // Split subline into steps using '|' or periods.
  const steps = subline
    .split(/\||(?<=[.?!])\s+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);

  // Fallback if there's only one step
  const safeSteps = steps.length > 0 ? steps : ["Processing step"];

  const staggerFrames = 35; // Frames between each step appearing

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5em",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "left",
      }}
    >
      {/* TIMELINE STEPS */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {safeSteps.map((step, i) => {
          const startFrame = i * staggerFrames;
          const stepFrame = Math.max(0, localFrame - startFrame);

          const progress = spring({
            fps,
            frame: stepFrame,
            config: { damping: 14, stiffness: 120, mass: 0.8 },
            durationInFrames: 25,
          });

          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const translateY = interpolate(progress, [0, 1], [15, 0]);

          const isLast = i === safeSteps.length - 1;

          // Line drawing animation connecting to the next dot
          const lineProgress = interpolate(
            localFrame - (startFrame + 10), // Line starts drawing shortly after step starts
            [0, staggerFrames * 0.8],
            [0, 100],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={i}
              style={{
                position: "relative",
                paddingLeft: "1.8em",
                paddingBottom: isLast ? "0" : "1.2em",
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "0.2em",
                  width: "0.6em",
                  height: "0.6em",
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6", // Bright blue
                  boxShadow: "0 0 0 0.15em rgba(59, 130, 246, 0.25)",
                }}
              />

              {/* Connecting Line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: "0.25em",
                    top: "1em",
                    width: "0.1em",
                    height: `${lineHeight(lineProgress)}%`,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    transformOrigin: "top",
                  }}
                />
              )}

              {/* Step Text */}
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "0.85em",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>

      {/* NARRATION (Typing effect) */}
      <div
        style={{
          marginTop: "0.5em",
          paddingTop: "1.2em",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: "1em",
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1.3,
          fontWeight: 400,
        }}
      >
        <Typewriter text={headline} localFrame={localFrame} startDelay={10} />
      </div>
    </div>
  );
};

// Helper for the percentage to avoid weird React height bugs
function lineHeight(progress: number): number {
  return progress > 100 ? 100 : progress < 0 ? 0 : progress;
}

const Typewriter: React.FC<{
  text: string;
  localFrame: number;
  startDelay: number;
}> = ({ text, localFrame, startDelay }) => {
  // 1.5 frames per character -> ~20 chars per second
  const charsToShow = Math.max(0, Math.floor((localFrame - startDelay) / 1.5));
  const visible = text.substring(0, charsToShow);
  const isTyping = charsToShow < text.length;
  const cursorBlink = Math.round(localFrame / 15) % 2 === 0;

  return (
    <span>
      {visible}
      <span
        style={{
          opacity: isTyping || cursorBlink ? 1 : 0,
          display: "inline-block",
          width: "0.35em",
          height: "0.9em",
          backgroundColor: "#3b82f6",
          marginLeft: "0.1em",
          verticalAlign: "baseline",
          transform: "translateY(-0.05em)",
        }}
      />
    </span>
  );
};
