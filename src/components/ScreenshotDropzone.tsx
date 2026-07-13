"use client";

import React, { useCallback, useRef, useState } from "react";

const ACCEPT = "image/png,image/jpeg,image/webp";

interface ScreenshotDropzoneProps {
  readonly file: File | null;
  readonly previewUrl: string | null;
  readonly isUploading: boolean;
  readonly uploadError: string | null;
  readonly onFileSelected: (file: File) => void;
  readonly onClear: () => void;
}

export const ScreenshotDropzone: React.FC<ScreenshotDropzoneProps> = ({
  file,
  previewUrl,
  isUploading,
  uploadError,
  onFileSelected,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      if (!candidate.type.startsWith("image/")) {
        return;
      }
      onFileSelected(candidate);
    },
    [onFileSelected],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      pickFile(event.dataTransfer.files[0]);
    },
    [pickFile],
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-300">Screenshot</label>

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
          "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragging
            ? "border-blue-400 bg-blue-500/10"
            : "border-neutral-700 bg-neutral-950 hover:border-neutral-500",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => pickFile(event.target.files?.[0])}
        />

        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Screenshot preview"
              className="max-h-28 rounded-md border border-neutral-700 object-contain"
            />
            <p className="text-xs text-neutral-400 truncate max-w-full">
              {file?.name ?? "Screenshot"}
            </p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              className="text-xs text-neutral-400 underline underline-offset-2 hover:text-white"
            >
              Anderes Bild wählen
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-white">
              Screenshot hierher ziehen
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              oder klicken · PNG, JPG, WebP · max. 10 MB
            </p>
          </>
        )}
      </div>

      {isUploading && (
        <p className="text-xs text-blue-400">Wird hochgeladen…</p>
      )}
      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  );
};
