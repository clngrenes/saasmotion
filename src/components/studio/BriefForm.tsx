"use client";

import React, { useRef, useState } from "react";
import { trimProductContext } from "../../lib/ai/trim-product-context";

function isAllowedContextFile(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === "package.json") return true;
  if (lower.startsWith("readme")) return true;
  if (lower === ".env" || lower.startsWith(".env.")) return true;
  return [".txt", ".md", ".json"].some((ext) => lower.endsWith(ext));
}

export const FUNNEL_STAGES = [
  { id: "awareness", label: "Top of Funnel (Awareness)" },
  { id: "consideration", label: "Middle (Consideration)" },
  { id: "conversion", label: "Bottom (Conversion)" },
] as const;

export type FunnelStageId = (typeof FUNNEL_STAGES)[number]["id"];

interface BriefFormProps {
  readonly description: string;
  readonly contextLoaded: boolean;
  readonly funnelStage: FunnelStageId;
  readonly onDescriptionChange: (value: string) => void;
  readonly onContextLoad: (text: string) => void;
  readonly onFunnelStageChange: (stage: FunnelStageId) => void;
}

export const BriefForm: React.FC<BriefFormProps> = ({
  description,
  contextLoaded,
  funnelStage,
  onDescriptionChange,
  onContextLoad,
  onFunnelStageChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [contextTrimmed, setContextTrimmed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <textarea
        rows={3}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="What does your app do? Who is it for? (optional)"
        className="w-full resize-none rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
      />

      <select
        value={funnelStage}
        onChange={(e) => onFunnelStageChange(e.target.value as FunnelStageId)}
        className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-200 focus:border-white/20 focus:outline-none appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
      >
        {FUNNEL_STAGES.map((stage) => (
          <option key={stage.id} value={stage.id} className="bg-[#111111] text-zinc-200">
            {stage.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => {
          setFileError(null);
          fileRef.current?.click();
        }}
        className="self-start rounded-lg border border-white/8 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-white/15 hover:text-zinc-200"
      >
        {contextLoaded ? "Product info added" : "Add README or .env"}
      </button>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;

          if (!isAllowedContextFile(file.name)) {
            setFileError(
              "Only .env, README, package.json, or text/markdown files.",
            );
            return;
          }

          setFileError(null);
          const text = await file.text();
          const trimmed = trimProductContext(text);
          setContextTrimmed(trimmed.length < text.length);
          onContextLoad(trimmed);
        }}
      />

      <p className="text-[10px] text-zinc-600">
        We read this when designing your video. macOS:{" "}
        <kbd className="rounded bg-white/5 px-1">⌘⇧.</kbd> to show hidden files.
      </p>

      {contextTrimmed && (
        <p className="text-[10px] text-amber-500/90">
          File was large — using first 12,000 characters for AI context.
        </p>
      )}
      {fileError && <p className="text-[11px] text-red-400">{fileError}</p>}
    </div>
  );
};
