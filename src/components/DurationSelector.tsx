"use client";

import React from "react";

const FPS = 30;

export const VIDEO_DURATION_OPTIONS = [
  { frames: 900, label: "30s", description: "Short" },
  { frames: 1800, label: "1:00", description: "Standard" },
  { frames: 2700, label: "1:30", description: "Detailed" },
  { frames: 3600, label: "2:00", description: "Full tour" },
] as const;

export type VideoDurationFrames =
  (typeof VIDEO_DURATION_OPTIONS)[number]["frames"];

export const DEFAULT_VIDEO_DURATION_FRAMES: VideoDurationFrames = 900;

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
      <span className="text-sm font-medium text-neutral-300">Duration</span>
      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Video duration">
        {VIDEO_DURATION_OPTIONS.map((option) => (
          <button
            key={option.frames}
            type="button"
            role="radio"
            aria-checked={value === option.frames}
            onClick={() => onChange(option.frames)}
            className={[
              "rounded-lg py-2 text-center text-[11px] transition-colors",
              value === option.frames
                ? "bg-white/10 text-white ring-1 ring-white/15"
                : "text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
