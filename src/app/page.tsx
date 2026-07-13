"use client";

import { Player } from "@remotion/player";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductBriefPanel } from "../components/ProductBriefPanel";
import { SceneScriptEditor } from "../components/SceneScriptEditor";
import {
  ScreenshotDropzone,
  type ScreenshotItem,
} from "../components/ScreenshotDropzone";
import {
  DEFAULT_VIDEO_DURATION_FRAMES,
  DurationSelector,
  type VideoDurationFrames,
} from "../components/DurationSelector";
import { getBrowserSupabase } from "../lib/supabase/client";
import {
  buildDefaultSceneCopy,
  buildVideoProps,
  mergeScenesWithCopy,
} from "../lib/video/build-video-props";
import { ScreenshotVideo } from "../remotion/compositions/ScreenshotVideo";
import {
  CAMERA_PRESET_NAMES,
  type CameraPresetName,
} from "../remotion/types/screenshot-video";
import type { RenderStatus } from "../types/render-job";
import type { GeneratedSceneCopy } from "../types/video-script";

const DEFAULT_PREVIEW_URLS = [
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=1950&fit=crop",
];

async function uploadScreenshot(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/screenshot", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Upload fehlgeschlagen");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export default function PreviewPage() {
  const [items, setItems] = useState<ScreenshotItem[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<(string | null)[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [productDescription, setProductDescription] = useState("");
  const [productContext, setProductContext] = useState("");
  const [productName, setProductName] = useState("SaaMotion");
  const [tagline, setTagline] = useState(
    "Cinematic 3D videos from your app screenshots",
  );
  const [sceneCopy, setSceneCopy] = useState<GeneratedSceneCopy[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [enableAudio, setEnableAudio] = useState(true);

  const [presetName, setPresetName] =
    useState<CameraPresetName>("zelios-style");
  const [durationInFrames, setDurationInFrames] =
    useState<VideoDurationFrames>(DEFAULT_VIDEO_DURATION_FRAMES);

  const [isRendering, setIsRendering] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<RenderStatus | null>(null);
  const [s3VideoUrl, setS3VideoUrl] = useState<string | null>(null);

  const blobUrlsRef = useRef<Set<string>>(new Set());

  const revokeAllBlobUrls = useCallback(() => {
    for (const url of blobUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    blobUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => revokeAllBlobUrls();
  }, [revokeAllBlobUrls]);

  const screenshotNames = useMemo(
    () => items.map((item) => item.file.name),
    [items],
  );

  const uploadItems = useCallback(async (nextItems: ScreenshotItem[]) => {
    setIsUploading(true);
    setUploadError(null);

    const urls: (string | null)[] = new Array(nextItems.length).fill(null);

    try {
      for (let index = 0; index < nextItems.length; index += 1) {
        urls[index] = await uploadScreenshot(nextItems[index].file);
      }
      setUploadedUrls(urls);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Upload fehlgeschlagen";
      setUploadError(message);
      setUploadedUrls([]);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      setUploadError(null);

      const newItems = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewUrl);
        return { file, previewUrl };
      });

      const nextItems = [...items, ...newItems];
      setItems(nextItems);
      setSceneCopy((prev) => {
        const next = [...prev];
        for (let i = prev.length; i < nextItems.length; i += 1) {
          next.push(buildDefaultSceneCopy(i, nextItems.length));
        }
        return next;
      });
      await uploadItems(nextItems);
    },
    [items, uploadItems],
  );

  const handleRemove = useCallback(
    async (index: number) => {
      const removed = items[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        blobUrlsRef.current.delete(removed.previewUrl);
      }

      const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
      setItems(nextItems);
      setSceneCopy((prev) => prev.filter((_, i) => i !== index));

      if (nextItems.length === 0) {
        setUploadedUrls([]);
        setUploadError(null);
        return;
      }

      await uploadItems(nextItems);
    },
    [items, uploadItems],
  );

  const handleClear = useCallback(() => {
    revokeAllBlobUrls();
    setItems([]);
    setUploadedUrls([]);
    setUploadError(null);
    setSceneCopy([]);
  }, [revokeAllBlobUrls]);

  const previewUrls =
    items.length > 0
      ? items.map((item) => item.previewUrl)
      : DEFAULT_PREVIEW_URLS;

  const effectiveSceneCopy = useMemo(() => {
    if (sceneCopy.length === previewUrls.length && sceneCopy.length > 0) {
      return sceneCopy;
    }
    return previewUrls.map((_, index) =>
      buildDefaultSceneCopy(index, previewUrls.length),
    );
  }, [previewUrls, sceneCopy]);

  const playerInputProps = useMemo(
    () =>
      buildVideoProps({
        scenes: mergeScenesWithCopy(previewUrls, effectiveSceneCopy),
        productName: productName || "Your Product",
        tagline,
        presetName,
        durationInFrames,
        enableAudio,
      }),
    [
      previewUrls,
      effectiveSceneCopy,
      productName,
      tagline,
      presetName,
      durationInFrames,
      enableAudio,
    ],
  );

  const handleGenerateScript = async () => {
    if (items.length === 0) {
      alert("Bitte zuerst Screenshots hochladen.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription,
          productContext: productContext || undefined,
          screenshotNames,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "KI-Script fehlgeschlagen");
      }

      const data = (await res.json()) as {
        productName: string;
        tagline: string;
        scenes: GeneratedSceneCopy[];
      };

      setProductName(data.productName);
      setTagline(data.tagline);
      setSceneCopy(data.scenes);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "KI-Script fehlgeschlagen";
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSceneCopyChange = (
    index: number,
    field: "headline" | "subline",
    value: string,
  ) => {
    setSceneCopy((prev) => {
      const next = [...prev];
      const current = next[index] ?? buildDefaultSceneCopy(index, prev.length);
      next[index] = { ...current, [field]: value };
      return next;
    });
  };

  useEffect(() => {
    if (!jobId) return;

    let supabase;
    try {
      supabase = getBrowserSupabase();
    } catch {
      console.warn("Supabase env vars missing. Skipping realtime updates.");
      return;
    }

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "render_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const newStatus = payload.new.status as RenderStatus;
          setJobStatus(newStatus);

          if (newStatus === "done" && payload.new.s3_video_url) {
            setS3VideoUrl(payload.new.s3_video_url);
            setIsRendering(false);
          } else if (newStatus === "failed") {
            alert(`Rendering failed: ${payload.new.error_details}`);
            setIsRendering(false);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const handleRender = async () => {
    if (items.length === 0) {
      alert("Bitte zuerst mindestens einen Screenshot hochladen.");
      return;
    }

    if (isUploading) {
      alert("Screenshots werden noch hochgeladen. Kurz warten…");
      return;
    }

    let renderScreenshotUrls = uploadedUrls.filter(
      (url): url is string => Boolean(url),
    );

    if (renderScreenshotUrls.length !== items.length) {
      setIsUploading(true);
      try {
        renderScreenshotUrls = await Promise.all(
          items.map((item) => uploadScreenshot(item.file)),
        );
        setUploadedUrls(renderScreenshotUrls);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Upload fehlgeschlagen";
        alert(message);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const exportProps = buildVideoProps({
      scenes: mergeScenesWithCopy(renderScreenshotUrls, effectiveSceneCopy),
      productName: productName || "Your Product",
      tagline,
      presetName,
      durationInFrames,
      enableAudio,
    });

    setIsRendering(true);
    setJobId(null);
    setJobStatus("queued");
    setS3VideoUrl(null);

    try {
      const res = await fetch("/api/render/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ props: exportProps }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
          error?: string;
        } | null;
        throw new Error(
          body?.message ?? body?.error ?? "Fehler beim Starten des Render-Jobs",
        );
      }

      const data = await res.json();
      setJobId(data.jobId);
      setJobStatus(data.status);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Render-Job fehlgeschlagen";
      alert(message);
      setIsRendering(false);
      setJobStatus(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-100 font-sans">
      <aside className="w-[420px] flex-shrink-0 border-r border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-5 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">SaaMotion</h1>
          <p className="text-sm text-neutral-400">
            AI-powered cinematic product videos from screenshots.
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-grow">
          <ScreenshotDropzone
            items={items}
            isUploading={isUploading}
            uploadError={uploadError}
            onFilesAdded={handleFilesAdded}
            onRemove={handleRemove}
            onClear={handleClear}
          />

          <ProductBriefPanel
            screenshotCount={items.length}
            screenshotNames={screenshotNames}
            productDescription={productDescription}
            productContext={productContext}
            productName={productName}
            tagline={tagline}
            isGenerating={isGenerating}
            generateError={generateError}
            onDescriptionChange={setProductDescription}
            onContextChange={setProductContext}
            onProductNameChange={setProductName}
            onTaglineChange={setTagline}
            onGenerate={handleGenerateScript}
          />

          <SceneScriptEditor
            sceneCopy={effectiveSceneCopy}
            screenshotNames={screenshotNames}
            onChange={handleSceneCopyChange}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="presetName"
              className="text-sm font-medium text-neutral-300"
            >
              Kamera-Preset
            </label>
            <select
              id="presetName"
              value={presetName}
              onChange={(e) =>
                setPresetName(e.target.value as CameraPresetName)
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CAMERA_PRESET_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <DurationSelector
            value={durationInFrames}
            onChange={setDurationInFrames}
          />

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={enableAudio}
              onChange={(e) => setEnableAudio(e.target.checked)}
              className="rounded border-neutral-600 bg-neutral-950"
            />
            Musik & Sound-Effekte
          </label>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-neutral-800">
          <button
            onClick={handleRender}
            disabled={isRendering || isUploading || items.length === 0}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering
              ? "Exportiert..."
              : isUploading
                ? "Upload läuft..."
                : "Video exportieren"}
          </button>

          {jobId && (
            <div className="rounded-md bg-neutral-800/50 border border-neutral-700 p-3 flex flex-col gap-2">
              <div className="text-sm text-neutral-300 flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-blue-400 capitalize">
                  {jobStatus}
                </span>
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                ID: {jobId.split("-")[0]}...
              </div>

              {s3VideoUrl && (
                <a
                  href={s3VideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-center text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Video Herunterladen
                </a>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-8 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950">
        <div className="rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl bg-black">
          <Player
            component={ScreenshotVideo}
            inputProps={playerInputProps}
            durationInFrames={durationInFrames}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={30}
            style={{
              width: "100%",
              maxWidth: "400px",
              aspectRatio: "1080 / 1920",
            }}
            controls
            loop
            autoPlay
            acknowledgeRemotionLicense
          />
        </div>
      </main>
    </div>
  );
}
