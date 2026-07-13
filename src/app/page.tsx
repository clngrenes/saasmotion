"use client";

import { Player } from "@remotion/player";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScreenshotDropzone } from "../components/ScreenshotDropzone";
import { getBrowserSupabase } from "../lib/supabase/client";
import { ScreenshotVideo } from "../remotion/compositions/ScreenshotVideo";
import {
  CAMERA_PRESET_NAMES,
  type CameraPresetName,
} from "../remotion/types/screenshot-video";
import type { RenderStatus } from "../types/render-job";

const DEFAULT_PREVIEW_URL =
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=1950&fit=crop";

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
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [presetName, setPresetName] =
    useState<CameraPresetName>("zelios-style");
  const [durationInFrames, setDurationInFrames] = useState(150);

  const [isRendering, setIsRendering] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<RenderStatus | null>(null);
  const [s3VideoUrl, setS3VideoUrl] = useState<string | null>(null);

  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokeBlobUrl();
  }, [revokeBlobUrl]);

  const handleFileSelected = useCallback(
    async (file: File) => {
      revokeBlobUrl();
      setScreenshotFile(file);
      setUploadError(null);
      setUploadedUrl(null);

      const blobUrl = URL.createObjectURL(file);
      blobUrlRef.current = blobUrl;
      setPreviewUrl(blobUrl);

      setIsUploading(true);
      try {
        const url = await uploadScreenshot(file);
        setUploadedUrl(url);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Upload fehlgeschlagen";
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [revokeBlobUrl],
  );

  const handleClearScreenshot = useCallback(() => {
    revokeBlobUrl();
    setScreenshotFile(null);
    setPreviewUrl(null);
    setUploadedUrl(null);
    setUploadError(null);
  }, [revokeBlobUrl]);

  const playerScreenshotUrl = previewUrl ?? DEFAULT_PREVIEW_URL;

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
    if (!screenshotFile) {
      alert("Bitte zuerst einen Screenshot hochladen.");
      return;
    }

    if (isUploading) {
      alert("Screenshot wird noch hochgeladen. Kurz warten…");
      return;
    }

    let renderScreenshotUrl = uploadedUrl;
    if (!renderScreenshotUrl) {
      setIsUploading(true);
      try {
        renderScreenshotUrl = await uploadScreenshot(screenshotFile);
        setUploadedUrl(renderScreenshotUrl);
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

    setIsRendering(true);
    setJobId(null);
    setJobStatus("queued");
    setS3VideoUrl(null);

    try {
      const res = await fetch("/api/render/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          props: {
            screenshotUrl: renderScreenshotUrl,
            presetName,
            durationInFrames,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Fehler beim Starten des Render-Jobs");
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
      <aside className="w-96 flex-shrink-0 border-r border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">SaaMotion</h1>
          <p className="text-sm text-neutral-400">
            Cinematic 3D videos from a single screenshot.
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-grow">
          <ScreenshotDropzone
            file={screenshotFile}
            previewUrl={previewUrl}
            isUploading={isUploading}
            uploadError={uploadError}
            onFileSelected={handleFileSelected}
            onClear={handleClearScreenshot}
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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="durationInFrames"
              className="text-sm font-medium text-neutral-300"
            >
              Dauer (in Frames, 30 FPS)
            </label>
            <input
              id="durationInFrames"
              type="number"
              min="30"
              max="600"
              value={durationInFrames}
              onChange={(e) =>
                setDurationInFrames(parseInt(e.target.value, 10))
              }
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-neutral-800">
          <button
            onClick={handleRender}
            disabled={isRendering || isUploading || !screenshotFile}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering
              ? "Rendert..."
              : isUploading
                ? "Upload läuft..."
                : "Rendern via SQS"}
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
            inputProps={{
              screenshotUrl: playerScreenshotUrl,
              presetName,
              durationInFrames,
            }}
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
