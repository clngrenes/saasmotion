"use client";

import React from "react";
import {
  DEFAULT_TEXT_PRESET,
  TEXT_PRESET_CATEGORIES,
  type TextPresetId,
} from "../../remotion/text-presets/catalog";

interface TextPresetPickerProps {
  readonly value: TextPresetId;
  readonly onChange: (value: TextPresetId) => void;
}

export const TextPresetPicker: React.FC<TextPresetPickerProps> = ({
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-4">
    {TEXT_PRESET_CATEGORIES.map((category) => (
      <div key={category.id}>
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
          {category.label}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {category.presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={[
                "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                value === preset.id
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/6 bg-white/[0.02] text-zinc-500 hover:border-white/12 hover:text-zinc-300",
              ].join(" ")}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/40 text-sm text-zinc-300">
                {preset.hint}
              </span>
              <span className="text-[11px] font-medium">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    ))}
    {value === DEFAULT_TEXT_PRESET && (
      <p className="text-[10px] text-zinc-600">Default: Slide ↑ (Jitter-style)</p>
    )}
  </div>
);
