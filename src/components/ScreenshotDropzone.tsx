"use client";

import React, { useCallback, useRef, useState } from "react";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_FILES = 8;

export interface ScreenshotItem {
  readonly file: File;
  readonly previewUrl: string;
}

interface ScreenshotDropzoneProps {
  readonly items: readonly ScreenshotItem[];
  readonly isUploading: boolean;
  readonly uploadError: string | null;
  readonly onFilesAdded: (files: File[]) => void;
  readonly onRemove: (index: number) => void;
  readonly onClear: () => void;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export const ScreenshotDropzone: React.FC<ScreenshotDropzoneProps> = ({
  items,
  isUploading,
  uploadError,
  onFilesAdded,
  onRemove,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFiles = useCallback(
    (fileList: FileList | undefined) => {
      if (!fileList?.length) return;

      const images = Array.from(fileList).filter(isImageFile);
      if (!images.length) return;

      const remaining = MAX_FILES - items.length;
      if (remaining <= 0) return;

      onFilesAdded(images.slice(0, remaining));
    },
    [items.length, onFilesAdded],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      pickFiles(event.dataTransfer.files);
    },
    [pickFiles],
  );

  const canAddMore = items.length < MAX_FILES;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-neutral-300">
          Screenshots
        </label>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-neutral-400 underline underline-offset-2 hover:text-white"
          >
            Alle entfernen
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className="relative rounded-md border border-neutral-700 bg-neutral-950 p-2"
            >
              <img
                src={item.previewUrl}
                alt={`Screenshot ${index + 1}`}
                className="h-24 w-full rounded object-contain"
              />
              <p className="mt-1 truncate text-[10px] text-neutral-500">
                {index + 1}. {item.file.name}
              </p>
              <button
                type="button"
                aria-label={`Screenshot ${index + 1} entfernen`}
                onClick={() => onRemove(index)}
                className="absolute right-1 top-1 rounded bg-neutral-900/90 px-1.5 py-0.5 text-[10px] text-neutral-300 hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={[
            "relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
            isDragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-neutral-700 bg-neutral-950 hover:border-neutral-500",
          ].join(" ")}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              pickFiles(event.target.files ?? undefined);
              event.target.value = "";
            }}
          />

          <p className="text-sm font-medium text-white">
            {items.length === 0
              ? "Screenshots hierher ziehen"
              : "Weitere Screenshots hinzufügen"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            PNG, JPG, WebP · max. 10 MB · bis zu {MAX_FILES} Bilder
          </p>
          {items.length > 0 && (
            <p className="mt-1 text-xs text-neutral-600">
              {items.length}/{MAX_FILES} ausgewählt
            </p>
          )}
        </div>
      )}

      {isUploading && (
        <p className="text-xs text-blue-400">Wird hochgeladen…</p>
      )}
      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  );
};
