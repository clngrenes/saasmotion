"use client";

import React from "react";
import {
  STYLE_PACKS,
  type StylePackId,
} from "../../remotion/styles/catalog";

interface StylePackPickerProps {
  readonly value: StylePackId;
  readonly onChange: (id: StylePackId) => void;
}

export const StylePackPicker: React.FC<StylePackPickerProps> = ({
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-2">
    {STYLE_PACKS.map((pack) => {
      const selected = value === pack.id;
      return (
        <button
          key={pack.id}
          type="button"
          onClick={() => onChange(pack.id)}
          className={[
            "rounded-xl border px-3.5 py-3 text-left transition-colors",
            selected
              ? "border-white/25 bg-white/[0.08] ring-1 ring-white/15"
              : "border-white/8 bg-white/[0.02] hover:border-white/15",
          ].join(" ")}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={[
                "text-sm font-medium",
                selected ? "text-white" : "text-zinc-300",
              ].join(" ")}
            >
              {pack.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">
              {pack.hint}
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-snug text-zinc-500">
            {pack.description}
          </p>
          {pack.referenceUrl && selected && (
            <a
              href={pack.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-block text-[11px] text-zinc-400 underline decoration-white/20 underline-offset-2 hover:text-zinc-200"
            >
              Reference video ↗
            </a>
          )}
        </button>
      );
    })}
  </div>
);
