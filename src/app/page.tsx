"use client";

import { Player } from "@remotion/player";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssetDropzone } from "../components/studio/AssetDropzone";
import { BriefForm } from "../components/studio/BriefForm";
import { SceneList } from "../components/studio/SceneList";
import { StyleControls } from "../components/studio/StyleControls";
import { StudioSection } from "../components/studio/StudioSection";
import {
  DEFAULT_VIDEO_DURATION_FRAMES,
  type VideoDurationFrames,
} from "../components/DurationSelector";
import { getBrowserSupabase } from "../lib/supabase/client";
import {
  buildDefaultSceneCopy,
  buildVideoProps,
  mergeScenesWithCopy,
} from "../lib/video/build-video-props";
import { ScreenshotVideo } from "../remotion/compositions/ScreenshotVideo";
import type { CameraPresetName } from "../remotion/types/screenshot-video";
import type { RenderStatus } from "../types/render-job";
import type { ScreenshotItem } from "../types/screenshot";
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
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Upload failed");
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
  const [tagline, setTagline] = useState("Cinematic product videos from screenshots");
  const [sceneCopy, setSceneCopy] = useState<GeneratedSceneCopy[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [enableAudio, setEnableAudio] = useState(true);

  const [presetName, setPresetName] = useState<CameraPresetName>("zelios-style");
  const [durationInFrames, setDurationInFrames] =
    useState<VideoDurationFrames>(DEFAULT_VIDEO_DURATION_FRAMES);

  const [isRendering, setIsRendering] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<RenderStatus | null>(null);
  const [s3VideoUrl, setS3VideoUrl] = useState<string | null>(null);

  const blobUrlsRef = useRef<Set<string>>(new Set());

  const revokeAllBlobUrls = useCallback(() => {
    for (const url of blobUrlsRef.current) URL.revokeObjectURL(url);
    blobUrlsRef.current.clear();
  }, []);

  useEffect(() => () => revokeAllBlobUrls(), [revokeAllBlobUrls]);

  const uploadItems = useCallback(async (nextItems: ScreenshotItem[]) => {
    setIsUploading(true);
    setUploadError(null);
    const urls: (string | null)[] = new Array(nextItems.length).fill(null);
    try {
      for (let i = 0; i < nextItems.length; i += 1) {
        urls[i] = await uploadScreenshot(nextItems[i].file);
      }
      setUploadedUrls(urls);
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
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
      const nextItems = items.filter((_, i) => i !== index);
      setItems(nextItems);
      setSceneCopy((prev) => prev.filter((_, i) => i !== index));
      if (nextItems.length === 0) {
        setUploadedUrls([]);
        return;
      }
      await uploadItems(nextItems);
    },
    [items, uploadItems],
  );

  const previewUrls = items.length > 0 ? items.map((i) => i.previewUrl) : DEFAULT_PREVIEW_URLS;

  const effectiveSceneCopy = useMemo(() => {
    if (sceneCopy.length === previewUrls.length && sceneCopy.length > 0) return sceneCopy;
    return previewUrls.map((_, i) => buildDefaultSceneCopy(i, previewUrls.length));
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
    [previewUrls, effectiveSceneCopy, productName, tagline, presetName, durationInFrames, enableAudio],
  );

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription,
          productContext: productContext || undefined,
          screenshotNames: items.map((i) => i.file.name),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Generation failed");
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
      setGenerateError(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let supabase;
    try {
      supabase = getBrowserSupabase();
    } catch {
      return;
    }
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "render_jobs", filter: `id=eq.${jobId}` },
        (payload) => {
          const status = payload.new.status as RenderStatus;
          setJobStatus(status);
          if (status === "done" && payload.new.s3_video_url) {
            setS3VideoUrl(payload.new.s3_video_url);
            setIsRendering(false);
          } else if (status === "failed") {
            alert(payload.new.error_details ?? "Render failed");
            setIsRendering(false);
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  const handleRender = async () => {
    if (!items.length || isUploading) return;

    let urls = uploadedUrls.filter((u): u is string => Boolean(u));
    if (urls.length !== items.length) {
      setIsUploading(true);
      try {
        urls = await Promise.all(items.map((i) => uploadScreenshot(i.file)));
        setUploadedUrls(urls);
      } catch (error: unknown) {
        alert(error instanceof Error ? error.message : "Upload failed");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    setIsRendering(true);
    setJobId(null);
    setJobStatus("queued");
    setS3VideoUrl(null);

    try {
      const res = await fetch("/api/render/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          props: buildVideoProps({
            scenes: mergeScenesWithCopy(urls, effectiveSceneCopy),
            productName: productName || "Your Product",
            tagline,
            presetName,
            durationInFrames,
            enableAudio,
          }),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        throw new Error(body?.message ?? body?.error ?? "Export failed");
      }
      const data = await res.json();
      setJobId(data.jobId);
      setJobStatus(data.status);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Export failed");
      setIsRendering(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--studio-bg)]">
      <aside className="flex w-[min(100%,380px)] shrink-0 flex-col border-r border-white/6 bg-[var(--studio-panel)]">
        <header className="border-b border-white/6 px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-600">SaaMotion</p>
          <h1 className="mt-1 text-lg font-medium tracking-tight text-white">
            {productName}
          </h1>
          {tagline && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{tagline}</p>
          )}
        </header>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
          <StudioSection title="Assets" hint={`${items.length}/8`}>
            <AssetDropzone
              items={items}
              isUploading={isUploading}
              error={uploadError}
              onFilesAdded={handleFilesAdded}
              onRemove={handleRemove}
            />
          </StudioSection>

          <StudioSection title="Brief">
            <BriefForm
              description={productDescription}
              contextLoaded={productContext.length > 0}
              isGenerating={isGenerating}
              error={generateError}
              disabled={items.length === 0}
              onDescriptionChange={setProductDescription}
              onContextLoad={setProductContext}
              onGenerate={handleGenerateScript}
            />
          </StudioSection>

          {effectiveSceneCopy.length > 0 && items.length > 0 && (
            <StudioSection title="Script">
              <SceneList scenes={effectiveSceneCopy} onChange={(index, field, value) => {
                setSceneCopy((prev) => {
                  const next = [...prev];
                  const current = next[index] ?? buildDefaultSceneCopy(index, prev.length);
                  next[index] = { ...current, [field]: value };
                  return next;
                });
              }} />
            </StudioSection>
          )}

          <StudioSection title="Style">
            <StyleControls
              presetName={presetName}
              durationInFrames={durationInFrames}
              enableAudio={enableAudio}
              onPresetChange={setPresetName}
              onDurationChange={setDurationInFrames}
              onAudioChange={setEnableAudio}
            />
          </StudioSection>
        </div>

        <footer className="border-t border-white/6 p-6">
          <button
            type="button"
            onClick={handleRender}
            disabled={isRendering || isUploading || items.length === 0}
            className="w-full rounded-xl bg-white py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isRendering ? "Exporting…" : isUploading ? "Uploading…" : "Export video"}
          </button>

          {jobId && (
            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="capitalize">{jobStatus}</span>
              {s3VideoUrl && (
                <a href={s3VideoUrl} target="_blank" rel="noopener noreferrer" className="text-white underline-offset-2 hover:underline">
                  Download
                </a>
              )}
            </div>
          )}
        </footer>
      </aside>

      <main className="relative flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_55%)] p-10">
        <div className="overflow-hidden rounded-[1.75rem] shadow-[0_40px_120px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
          <Player
            component={ScreenshotVideo}
            inputProps={playerInputProps}
            durationInFrames={durationInFrames}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={30}
            style={{ width: "min(42vh * 1080 / 1920, 100%)", maxWidth: 380, aspectRatio: "1080 / 1920" }}
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
