"use client";

import React, { useRef, useState } from "react";
import type { GeneratedVideoScript } from "../types/video-script";

const CONTEXT_ACCEPT = ".env,.env.example,.env.local,package.json,README.md,.txt";

interface ProductBriefPanelProps {
  readonly screenshotCount: number;
  readonly screenshotNames: readonly string[];
  readonly productDescription: string;
  readonly productContext: string;
  readonly productName: string;
  readonly tagline: string;
  readonly isGenerating: boolean;
  readonly generateError: string | null;
  readonly onDescriptionChange: (value: string) => void;
  readonly onContextChange: (value: string) => void;
  readonly onProductNameChange: (value: string) => void;
  readonly onTaglineChange: (value: string) => void;
  readonly onGenerate: () => void;
}

export const ProductBriefPanel: React.FC<ProductBriefPanelProps> = ({
  screenshotCount,
  screenshotNames,
  productDescription,
  productContext,
  productName,
  tagline,
  isGenerating,
  generateError,
  onDescriptionChange,
  onContextChange,
  onProductNameChange,
  onTaglineChange,
  onGenerate,
}) => {
  const contextFileRef = useRef<HTMLInputElement>(null);

  const handleContextFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    onContextChange(text);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3">
      <div>
        <h2 className="text-sm font-semibold text-white">Produkt-Briefing</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Beschreibung + Kontext für die KI-Copy (Intro, Headlines, Sublines).
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="productDescription" className="text-xs font-medium text-neutral-300">
          Was macht dein SaaS?
        </label>
        <textarea
          id="productDescription"
          rows={3}
          value={productDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="z.B. SaaMotion verwandelt App-Screenshots in cinematic Product Videos für Landing Pages…"
          className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-300">
          Produktkontext (.env.example, README, package.json)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => contextFileRef.current?.click()}
            className="shrink-0 rounded-md border border-neutral-700 px-3 py-2 text-xs text-neutral-300 hover:border-neutral-500 hover:text-white"
          >
            Datei laden
          </button>
          <span className="self-center text-[10px] text-neutral-600 truncate">
            {productContext ? `${productContext.length} Zeichen geladen` : "Optional"}
          </span>
        </div>
        <input
          ref={contextFileRef}
          type="file"
          accept={CONTEXT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            void handleContextFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <textarea
          rows={2}
          value={productContext}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="Oder Kontext hier einfügen…"
          className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-300 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || screenshotCount === 0 || productDescription.trim().length < 10}
        className="w-full rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? "KI schreibt Script…" : "Script mit KI generieren"}
      </button>

      {generateError && (
        <p className="text-xs text-red-400">{generateError}</p>
      )}

      {(productName || tagline) && (
        <div className="rounded-md border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs">
          <p className="font-medium text-white">{productName || "Produktname"}</p>
          {tagline && <p className="mt-1 text-neutral-400">{tagline}</p>}
          <p className="mt-2 text-[10px] text-neutral-600">
            {screenshotNames.length} Szenen: {screenshotNames.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

export type { GeneratedVideoScript };
