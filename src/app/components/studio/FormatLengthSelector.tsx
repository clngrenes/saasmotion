import React from "react";
import type { VideoAspectRatioId } from "../../remotion/constants/aspect-ratio";
import type { VideoDurationFrames } from "../../components/DurationSelector";

interface FormatLengthSelectorProps {
  readonly aspectRatio: VideoAspectRatioId;
  readonly durationInFrames: VideoDurationFrames;
  readonly onAspectRatioChange: (val: VideoAspectRatioId) => void;
  readonly onDurationChange: (val: VideoDurationFrames) => void;
}

function AspectRatioIcon({ ratio }: { readonly ratio: VideoAspectRatioId }) {
  if (ratio === "16:9") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
      </svg>
    );
  }
  if (ratio === "9:16") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="2" />
      </svg>
    );
  }
  if (ratio === "1:1") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
    );
  }
  if (ratio === "4:5") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="2" />
      </svg>
    );
  }
  return null;
}

function DurationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export const FormatLengthSelector: React.FC<FormatLengthSelectorProps> = ({
  aspectRatio,
  durationInFrames,
  onAspectRatioChange,
  onDurationChange,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-zinc-400">Aspect Ratio</label>
        <div className="grid grid-cols-4 gap-2">
          {(["16:9", "9:16", "1:1", "4:5"] as const).map((ratio) => {
            const isSelected = aspectRatio === ratio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => onAspectRatioChange(ratio)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-2 transition-all ${
                  isSelected
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/8 bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                }`}
              >
                <AspectRatioIcon ratio={ratio} />
                <span className="text-[10px] font-medium tracking-wide">{ratio}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-medium text-zinc-400">Duration</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 900, label: "30s" },
            { value: 1800, label: "1m" },
            { value: 2700, label: "1m 30s" },
            { value: 3600, label: "2m" },
          ].map(({ value, label }) => {
            const isSelected = durationInFrames === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onDurationChange(value as VideoDurationFrames)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-2 transition-all ${
                  isSelected
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-white/8 bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                }`}
              >
                <DurationIcon />
                <span className="text-[10px] font-medium tracking-wide whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
