"use client";

import React from "react";
import type { GeneratedSceneCopy } from "../types/video-script";

interface SceneScriptEditorProps {
  readonly sceneCopy: readonly GeneratedSceneCopy[];
  readonly screenshotNames: readonly string[];
  readonly onChange: (index: number, field: "headline" | "subline", value: string) => void;
}

export const SceneScriptEditor: React.FC<SceneScriptEditorProps> = ({
  sceneCopy,
  screenshotNames,
  onChange,
}) => {
  if (sceneCopy.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-white">Szenen-Texte</h2>
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {sceneCopy.map((scene, index) => (
          <div
            key={`scene-${index}`}
            className="rounded-md border border-neutral-800 bg-neutral-950 p-2.5 flex flex-col gap-2"
          >
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
              Szene {index + 1}
              {screenshotNames[index] ? ` · ${screenshotNames[index]}` : ""}
            </p>
            <input
              type="text"
              value={scene.headline}
              onChange={(e) => onChange(index, "headline", e.target.value)}
              placeholder="Headline"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              value={scene.subline}
              onChange={(e) => onChange(index, "subline", e.target.value)}
              placeholder="Subline"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
