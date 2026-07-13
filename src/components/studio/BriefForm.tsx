"use client";

import React, { useRef } from "react";

const CONTEXT_ACCEPT = ".env,.env.example,.env.local,package.json,README.md,.txt";

interface BriefFormProps {
  readonly description: string;
  readonly contextLoaded: boolean;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly disabled: boolean;
  readonly onDescriptionChange: (value: string) => void;
  readonly onContextLoad: (text: string) => void;
  readonly onGenerate: () => void;
}

export const BriefForm: React.FC<BriefFormProps> = ({
  description,
  contextLoaded,
  isGenerating,
  error,
  disabled,
  onDescriptionChange,
  onContextLoad,
  onGenerate,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <textarea
        rows={3}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="What does your product do?"
        className="w-full resize-none rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-white/8 px-3 py-1.5 text-[11px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-white/15 hover:text-zinc-200"
        >
          {contextLoaded ? "Context loaded" : "Add .env / README"}
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || isGenerating || description.trim().length < 10}
          className="ml-auto rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isGenerating ? "Writing…" : "Generate"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={CONTEXT_ACCEPT}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) onContextLoad(await file.text());
          e.target.value = "";
        }}
      />

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
};
