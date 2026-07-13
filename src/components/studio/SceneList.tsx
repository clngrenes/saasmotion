"use client";

import React from "react";
import type { GeneratedSceneCopy } from "../../types/video-script";

interface SceneListProps {
  readonly scenes: readonly GeneratedSceneCopy[];
  readonly onChange: (index: number, field: "headline" | "subline", value: string) => void;
}

export const SceneList: React.FC<SceneListProps> = ({ scenes, onChange }) => {
  if (scenes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {scenes.map((scene, index) => (
        <div
          key={`scene-${index}`}
          className="rounded-xl border border-white/6 bg-white/[0.02] p-3"
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            Scene {index + 1}
          </p>
          <input
            value={scene.headline}
            onChange={(e) => onChange(index, "headline", e.target.value)}
            className="mb-2 w-full border-0 border-b border-white/8 bg-transparent pb-1.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
            placeholder="Headline"
          />
          <input
            value={scene.subline}
            onChange={(e) => onChange(index, "subline", e.target.value)}
            className="w-full border-0 bg-transparent text-xs text-zinc-400 placeholder:text-zinc-700 focus:outline-none"
            placeholder="Subline"
          />
        </div>
      ))}
    </div>
  );
};
