"use client";

import { Player } from "@remotion/player";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssetDropzone } from "../components/studio/AssetDropzone";
import { BriefForm } from "../components/studio/BriefForm";
import { ExportProgressPanel, type ExportPhase } from "../components/studio/ExportProgressPanel";
import { LogoDropzone } from "../components/studio/LogoDropzone";
import { FormatLengthSelector } from "../components/studio/FormatLengthSelector";
import { StudioSection } from "../components/studio/StudioSection";
import {
  DEFAULT_TEXT_PRESET,
  type TextPresetId,
} from "../remotion/text-presets/catalog";
import {
  DEFAULT_VIDEO_DURATION_FRAMES,
  type VideoDurationFrames,
} from "../components/DurationSelector";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  getVideoDimensions,
  type VideoAspectRatioId,
} from "../remotion/constants/aspect-ratio";
import { getBrowserSupabase } from "../lib/supabase/client";
import {
  buildDefaultSceneCopy,
  buildVideoProps,
  mergeScenesWithCopy,
} from "../lib/video/build-video-props";
import { scriptToRenderConfig } from "../lib/video/apply-generated-script";
import { generatedArtDirectionToArtDirection } from "../lib/video/art-direction";
import { generatedAudioDirectionToAudioDirection, normalizeAudioDirection } from "../lib/video/audio-direction";
import type { ArtDirection } from "../remotion/art-direction/catalog";
import type { AudioDirection } from "../remotion/constants/audio-catalog";
import { isTextPresetId } from "../remotion/text-presets/catalog";
import { ScreenshotVideo } from "../remotion/compositions/ScreenshotVideo";
import type { CameraPresetName, FrameStyleId } from "../remotion/types/screenshot-video";
import type { RenderStatus } from "../types/render-job";
import type { ScreenshotItem } from "../types/screenshot";
import type { GeneratedSceneCopy, GeneratedVideoScript } from "../types/video-script";
import type { UIReconstruction } from "../types/ui-reconstruction";

const DEFAULT_PREVIEW_URLS = [
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=1950&fit=crop",
];

async function uploadLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload/logo", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Logo upload failed");
  }
  const data = (await response.json()) as { url: string };
  return data.url;
}

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

async function reconstructScreenshots(
  urls: readonly string[],
  names: readonly string[],
): Promise<(UIReconstruction | null)[]> {
  return Promise.all(
    urls.map(async (url, index) => {
      try {
        const res = await fetch("/api/reconstruct/screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenshotUrl: url,
            screenshotName: names[index] ?? `screen-${index + 1}`,
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { uiTree: UIReconstruction };
        return data.uiTree;
      } catch {
        return null;
      }
    }),
  );
}

export default function PreviewPage() {
  const [items, setItems] = useState<ScreenshotItem[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<(string | null)[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [productDescription, setProductDescription] = useState("");
  const [productContext, setProductContext] = useState("");
  const [funnelStage, setFunnelStage] = useState<"awareness" | "consideration" | "conversion">("awareness");
  const [productName, setProductName] = useState("Your app");
  const [tagline, setTagline] = useState("Upload screenshots — we handle the rest");
  const [sceneCopy, setSceneCopy] = useState<GeneratedSceneCopy[]>([]);
  const [exportPhase, setExportPhase] = useState<ExportPhase>("idle");
  const [exportError, setExportError] = useState<string | null>(null);

  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [presetName, setPresetName] = useState<CameraPresetName>("apple-style");
  const [frameStyle, setFrameStyle] = useState<FrameStyleId>("window");
  const [aspectRatio, setAspectRatio] =
    useState<VideoAspectRatioId>(DEFAULT_VIDEO_ASPECT_RATIO);
  const [textPreset, setTextPreset] =
    useState<TextPresetId>(DEFAULT_TEXT_PRESET);
  const [durationInFrames, setDurationInFrames] =
    useState<VideoDurationFrames>(DEFAULT_VIDEO_DURATION_FRAMES);
  const [artDirection, setArtDirection] = useState<ArtDirection | null>(null);
  const [audioDirection, setAudioDirection] = useState<AudioDirection | null>(null);
  const [uiTrees, setUiTrees] = useState<(UIReconstruction | null)[]>([]);
  const [previewReady, setPreviewReady] = useState(false);

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
      setPreviewReady(false);
      const newItems = files.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewUrl);
        return { file, previewUrl };
      });
      const nextItems = [...items, ...newItems];
      setItems(nextItems);
      
      if (items.length === 0) {
        // Auto-select duration based on screen count if user hasn't explicitly set it yet
        if (nextItems.length <= 2) setDurationInFrames(900);
        else if (nextItems.length <= 4) setDurationInFrames(1800);
        else if (nextItems.length <= 6) setDurationInFrames(2700);
        else setDurationInFrames(3600);
      }

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
      setPreviewReady(false);
      if (nextItems.length === 0) {
        setUploadedUrls([]);
        setProductName("Your app");
        setTagline("Upload screenshots — we handle the rest");
        setArtDirection(null);
        setAudioDirection(null);
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

  const canvasDimensions = useMemo(
    () => getVideoDimensions(aspectRatio),
    [aspectRatio],
  );

  const playerInputProps = useMemo(
    () =>
      buildVideoProps({
        scenes: mergeScenesWithCopy(previewUrls, effectiveSceneCopy, uiTrees),
        productName: productName || "Your app",
        tagline,
        presetName,
        durationInFrames,
        aspectRatio,
        textPreset,
        enableAudio: false,
        logoUrl: logoUrl ?? undefined,
        frameStyle,
        artDirection: artDirection ?? undefined,
        audioDirection: audioDirection ?? undefined,
      }),
    [previewUrls, effectiveSceneCopy, productName, tagline, presetName, durationInFrames, aspectRatio, textPreset, logoUrl, frameStyle, artDirection, audioDirection, uiTrees],
  );

  const applyScriptToState = useCallback((data: GeneratedVideoScript) => {
    const directed = generatedArtDirectionToArtDirection(
      data.artDirection,
      data.scenes.length,
    );
    const audio = normalizeAudioDirection(
      generatedAudioDirectionToAudioDirection(data.audioDirection),
      {
        hasLogo: Boolean(logoUrl),
        sceneTransition: directed.sceneTransition,
      },
    );
    setProductName(data.productName);
    setTagline(data.tagline);
    setSceneCopy([...data.scenes]);
    setPresetName(directed.cameraPreset);
    setFrameStyle(directed.frameStyle);
    setTextPreset(
      isTextPresetId(directed.textPreset) ? directed.textPreset : DEFAULT_TEXT_PRESET,
    );
    setAspectRatio(directed.aspectRatio);
    setDurationInFrames(directed.durationInFrames);
    setArtDirection(directed);
    setAudioDirection(audio);
    setPreviewReady(true);
    return { directed, audio };
  }, [logoUrl]);

  const generateScript = useCallback(async () => {
    const urls = uploadedUrls.filter((u): u is string => Boolean(u));
    if (urls.length !== items.length) {
      throw new Error("Screenshots are still uploading");
    }

    const description =
      productDescription.trim() ||
      (productContext
        ? "SaaS product — use the attached product context."
        : "Cinematic product demo from uploaded app screenshots.");

    const res = await fetch("/api/generate/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productDescription: description,
        productContext: productContext || undefined,
        funnelStage,
        screenshotNames: items.map((i) => i.file.name),
        screenshotUrls: urls,
        hasLogo: Boolean(logoUrl),
        requestedDuration: durationInFrames,
        requestedAspectRatio: aspectRatio,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "Video creation failed");
    }
    const data = (await res.json()) as GeneratedVideoScript;
    applyScriptToState(data);
    return data;
  }, [applyScriptToState, items, productContext, productDescription, funnelStage, uploadedUrls, logoUrl, durationInFrames, aspectRatio]);

  const handleLogoSelected = useCallback(async (file: File) => {
    setLogoError(null);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    const preview = URL.createObjectURL(file);
    blobUrlsRef.current.add(preview);
    setLogoPreviewUrl(preview);
    setIsUploadingLogo(true);
    try {
      const url = await uploadLogo(file);
      setLogoUrl(url);
      setPreviewReady(false);
    } catch (error: unknown) {
      setLogoError(error instanceof Error ? error.message : "Logo upload failed");
      setLogoUrl(null);
    } finally {
      setIsUploadingLogo(false);
    }
  }, [logoPreviewUrl]);

  const handleLogoRemove = useCallback(() => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      blobUrlsRef.current.delete(logoPreviewUrl);
    }
    setLogoPreviewUrl(null);
    setLogoUrl(null);
    setLogoError(null);
    setPreviewReady(false);
  }, [logoPreviewUrl]);

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
          if (status === "rendering") setExportPhase("rendering");
          if (status === "done" && payload.new.s3_video_url) {
            setS3VideoUrl(payload.new.s3_video_url);
            setIsRendering(false);
            setExportPhase("done");
          } else if (status === "failed") {
            setExportError(String(payload.new.error_details ?? "Render failed"));
            setIsRendering(false);
            setExportPhase("failed");
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [jobId]);

  useEffect(() => {
    if (!jobId || exportPhase === "done" || exportPhase === "failed") return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/render/status?jobId=${jobId}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: RenderStatus;
          videoUrl?: string;
          errorDetails?: string;
        };
        setJobStatus(data.status);
        if (data.status === "rendering") setExportPhase("rendering");
        if (data.status === "done" && data.videoUrl) {
          setS3VideoUrl(data.videoUrl);
          setExportPhase("done");
          setIsRendering(false);
        }
        if (data.status === "failed") {
          setExportError(data.errorDetails ?? "Render failed");
          setExportPhase("failed");
          setIsRendering(false);
        }
      } catch {
        // ignore transient poll errors
      }
    };

    void poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [jobId, exportPhase]);

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
    setExportPhase("script");
    setExportError(null);
    setJobId(null);
    setJobStatus(null);
    setS3VideoUrl(null);

    try {
      let script: GeneratedVideoScript;
      const names = items.map((i) => i.file.name);

      const [scriptOrNull, trees] = await Promise.all([
        (async () => {
          if (
            previewReady &&
            artDirection &&
            audioDirection &&
            sceneCopy.length === items.length
          ) {
            return {
              productName,
              tagline,
              scenes: sceneCopy,
              artDirection: {
                reasoning: artDirection.reasoning,
                cameraPreset: artDirection.cameraPreset,
                frameStyle: artDirection.frameStyle,
                textPreset: artDirection.textPreset,
                aspectRatio: artDirection.aspectRatio,
                durationInFrames: artDirection.durationInFrames,
                background: artDirection.background,
                effects: artDirection.effects,
                style: artDirection.style,
                introMotion: artDirection.introMotion,
                sceneTransition: artDirection.sceneTransition,
                logoIntroMotion: artDirection.logoIntroMotion,
                logoIntroBackdrop: artDirection.logoIntroBackdrop,
                svgMotion: artDirection.svgMotion,
                svgAccent: artDirection.svgAccent,
              },
              audioDirection: {
                reasoning: audioDirection.reasoning,
                musicStyle: audioDirection.musicStyle,
                musicVolume: audioDirection.musicVolume,
                transitionSfx: audioDirection.transitionSfx,
                sfxVolume: audioDirection.sfxVolume,
                playIntroRevealSfx: audioDirection.playIntroRevealSfx,
              },
            } satisfies GeneratedVideoScript;
          }
          return generateScript();
        })(),
        reconstructScreenshots(urls, names),
      ]);

      script = scriptOrNull;
      setUiTrees(trees);

      setExportPhase("queued");

      const { props } = scriptToRenderConfig(script, urls, {
        logoUrl: logoUrl ?? undefined,
        uiTrees: trees,
      });

      const res = await fetch("/api/render/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ props }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        throw new Error(body?.message ?? body?.error ?? "Export failed");
      }
      const data = await res.json();
      setJobId(data.jobId);
      setJobStatus(data.status);
      setExportPhase("rendering");
    } catch (error: unknown) {
      setExportError(error instanceof Error ? error.message : "Export failed");
      setExportPhase("failed");
      setIsRendering(false);
    }
  };

  const durationSeconds = durationInFrames / 30;
  const isExporting = exportPhase !== "idle" && exportPhase !== "done" && exportPhase !== "failed";

  const statusLine = isExporting && exportPhase === "script"
    ? "Rebuilding UI layers from screenshots…"
    : previewReady
      ? "Ready to create"
      : items.length > 0
        ? "Click Create video when ready"
        : "Add screenshots to start";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--studio-bg)]">
      <aside className="flex w-[min(100%,380px)] shrink-0 flex-col border-r border-white/6 bg-[var(--studio-panel)]">
        <header className="border-b border-white/6 px-6 py-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-600">SaasMotion</p>
          <h1 className="mt-1 text-lg font-medium tracking-tight text-white">
            {productName}
          </h1>
          {tagline && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{tagline}</p>
          )}
          <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            {statusLine}
          </p>
        </header>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
        <StudioSection title="Format & Length" hint="optional">
          <FormatLengthSelector
            aspectRatio={aspectRatio}
            durationInFrames={durationInFrames}
            onAspectRatioChange={(val) => {
              setAspectRatio(val);
              setPreviewReady(false);
            }}
            onDurationChange={(val) => {
              setDurationInFrames(val);
              setPreviewReady(false);
            }}
          />
        </StudioSection>

        <StudioSection title="Screenshots" hint={`${items.length}/8`}>
            <AssetDropzone
              items={items}
              isUploading={isUploading}
              error={uploadError}
              onFilesAdded={handleFilesAdded}
              onRemove={handleRemove}
            />
            <LogoDropzone
              previewUrl={logoPreviewUrl}
              isUploading={isUploadingLogo}
              error={logoError}
              onFileSelected={handleLogoSelected}
              onRemove={handleLogoRemove}
            />
          </StudioSection>

          <StudioSection title="About your product" hint="optional">
            <BriefForm
              description={productDescription}
              contextLoaded={productContext.length > 0}
              funnelStage={funnelStage}
              onDescriptionChange={(value) => {
                setProductDescription(value);
                setPreviewReady(false);
              }}
              onContextLoad={(value) => {
                setProductContext(value);
                setPreviewReady(false);
              }}
              onFunnelStageChange={(value) => {
                setFunnelStage(value);
                setPreviewReady(false);
              }}
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
            {isExporting
              ? exportPhase === "script"
                ? "Writing script…"
                : "Creating your video…"
              : isUploading
                ? "Uploading…"
                : "Create video"}
          </button>
        </footer>
      </aside>

      <main className="relative flex flex-1 items-center justify-center bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.04)_0%,_transparent_55%)] p-10">
        <ExportProgressPanel
          phase={exportPhase}
          jobStatus={jobStatus}
          sceneCount={items.length}
          durationSeconds={durationSeconds}
          videoUrl={s3VideoUrl}
          errorMessage={exportError}
          onReset={() => {
            setExportPhase("idle");
            setExportError(null);
            setJobId(null);
            setJobStatus(null);
          }}
        />
        <div className={`overflow-hidden rounded-[1.75rem] shadow-[0_40px_120px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-opacity ${isExporting ? "opacity-30" : ""}`}>
          <Player
            component={ScreenshotVideo}
            inputProps={playerInputProps}
            durationInFrames={durationInFrames}
            compositionWidth={canvasDimensions.width}
            compositionHeight={canvasDimensions.height}
            fps={30}
            style={{
              width: `min(42vh * ${canvasDimensions.width} / ${canvasDimensions.height}, 100%)`,
              maxWidth: canvasDimensions.width > canvasDimensions.height ? 520 : 380,
              aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}`,
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
