"use client";

import React, { useRef, useState } from "react";
import type { ScreenshotItem } from "../../types/screenshot";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_FILES = 8;

interface AssetDropzoneProps {
  readonly items: readonly ScreenshotItem[];
  readonly isUploading: boolean;
  readonly error: string | null;
  readonly onFilesAdded: (files: File[]) => void;
  readonly onRemove: (index: number) => void;
}

export const AssetDropzone: React.FC<AssetDropzoneProps> = ({
  items,
  isUploading,
  error,
  onFilesAdded,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFiles = (fileList: FileList | undefined) => {
    if (!fileList?.length) return;
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    onFilesAdded(images.slice(0, MAX_FILES - items.length));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {items.map((item, index) => (
            <div key={`${item.file.name}-${index}`} className="group relative aspect-[9/16] overflow-hidden rounded-md bg-zinc-900 ring-1 ring-white/5">
              <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute right-1 top-1 hidden rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-300 group-hover:block"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            pickFiles(e.dataTransfer.files);
          }}
          className={[
            "flex min-h-[88px] w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 transition-colors",
            isDragging
              ? "border-white/30 bg-white/[0.03]"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]",
          ].join(" ")}
        >
          <span className="text-sm text-zinc-300">
            {items.length === 0 ? "Drop screenshots" : "Add more"}
          </span>
          <span className="mt-1 text-[11px] text-zinc-600">
            {items.length}/{MAX_FILES}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          pickFiles(e.target.files ?? undefined);
          e.target.value = "";
        }}
      />

      {isUploading && <p className="text-[11px] text-zinc-500">Uploading…</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
};
