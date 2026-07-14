"use client";

import React from "react";
import {
  VIDEO_DURATION_OPTIONS,
  type VideoDurationFrames,
} from "../DurationSelector";
import {
  VIDEO_ASPECT_RATIO_OPTIONS,
  type VideoAspectRatioId,
} from "../../remotion/constants/aspect-ratio";
import {
  CAMERA_PRESET_NAMES,
  type CameraPresetName,
} from "../../remotion/types/screenshot-video";

interface StyleControlsProps {
  readonly presetName: CameraPresetName;
  readonly aspectRatio: VideoAspectRatioId;
  readonly durationInFrames: VideoDurationFrames;
  readonly enableAudio: boolean;
  readonly onPresetChange: (value: CameraPresetName) => void;
  readonly onAspectRatioChange: (value: VideoAspectRatioId) => void;
  readonly onDurationChange: (value: VideoDurationFrames) => void;
  readonly onAudioChange: (value: boolean) => void;
}

const PRESET_LABELS: Record<CameraPresetName, string> = {
  "zelios-style": "Dolly",
  "apple-style": "Orbit",
  "minimal-flat": "Slide",
};

export const StyleControls: React.FC<StyleControlsProps> = ({
  presetName,
  aspectRatio,
  durationInFrames,
  enableAudio,
  onPresetChange,
  onAspectRatioChange,
  onDurationChange,
  onAudioChange,
}) => (
  <div className="flex flex-col gap-4">
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
        Canvas
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {VIDEO_ASPECT_RATIO_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onAspectRatioChange(option.id)}
            className={[
              "flex flex-col items-center rounded-lg py-2 transition-colors",
              aspectRatio === option.id
                ? "bg-white/10 text-white ring-1 ring-white/15"
                : "text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            <span className="text-[11px] font-medium">{option.label}</span>
            <span className="text-[9px] text-zinc-500">{option.sublabel}</span>
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
        Camera
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CAMERA_PRESET_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onPresetChange(name)}
            className={[
              "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors",
              presetName === name
                ? "bg-white text-black"
                : "border border-white/8 text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            {PRESET_LABELS[name]}
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
        Duration
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {VIDEO_DURATION_OPTIONS.map((option) => (
          <button
            key={option.frames}
            type="button"
            onClick={() => onDurationChange(option.frames)}
            className={[
              "rounded-lg py-2 text-center text-[11px] transition-colors",
              durationInFrames === option.frames
                ? "bg-white/10 text-white ring-1 ring-white/15"
                : "text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    <button
      type="button"
      onClick={() => onAudioChange(!enableAudio)}
      className="flex items-center justify-between rounded-lg border border-white/6 px-3 py-2 text-left text-[11px] text-zinc-400"
    >
      <span>Music & SFX</span>
      <span className={enableAudio ? "text-white" : "text-zinc-600"}>
        {enableAudio ? "On" : "Off"}
      </span>
    </button>
  </div>
);
