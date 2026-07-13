"use client";

import React from "react";

const FPS = 30;

export const VIDEO_DURATION_OPTIONS = [
  {
    frames: 90,
    label: "3 Sek.",
    description: "Schnell & punchy",
  },
  {
    frames: 150,
    label: "5 Sek.",
    description: "Standard",
  },
  {
    frames: 210,
    label: "7 Sek.",
    description: "Cinematic",
  },
  {
    frames: 300,
    label: "10 Sek.",
    description: "Ausführlich",
  },
] as const;

export type VideoDurationFrames =
  (typeof VIDEO_DURATION_OPTIONS)[number]["frames"];

export const DEFAULT_VIDEO_DURATION_FRAMES: VideoDurationFrames = 150;

interface DurationSelectorProps {
  readonly value: VideoDurationFrames;
  readonly onChange: (frames: VideoDurationFrames) => void;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-300">Dauer</span>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Video-Dauer"
      >
        {VIDEO_DURATION_OPTIONS.map((option) => {
          const isSelected = value === option.frames;
          const seconds = option.frames / FPS;

          return (
            <button
              key={option.frames}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.frames)}
              className={[
                "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900",
                isSelected
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900",
              ].join(" ")}
            >
              <span className="text-sm font-semibold">{option.label}</span>
              <span
                className={[
                  "text-xs",
                  isSelected ? "text-blue-200/80" : "text-neutral-500",
                ].join(" ")}
              >
                {option.description}
              </span>
              <span className="sr-only">{seconds} Sekunden bei {FPS} FPS</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
