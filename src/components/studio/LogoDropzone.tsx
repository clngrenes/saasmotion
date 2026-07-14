"use client";

import React, { useRef } from "react";

const ACCEPT = "image/png,image/svg+xml,image/webp,.svg";

interface LogoDropzoneProps {
  readonly previewUrl: string | null;
  readonly isUploading: boolean;
  readonly error: string | null;
  readonly onFileSelected: (file: File) => void;
  readonly onRemove: () => void;
}

export const LogoDropzone: React.FC<LogoDropzoneProps> = ({
  previewUrl,
  isUploading,
  error,
  onFileSelected,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/12 bg-white/[0.02] transition-colors hover:border-white/20 disabled:opacity-50"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Logo preview"
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">
              Logo
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-zinc-400">
            {previewUrl ? "Logo ready" : "PNG or SVG"}
          </p>
          <p className="text-[10px] text-zinc-600">Shown in the intro</p>
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFileSelected(file);
        }}
      />

      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
};
