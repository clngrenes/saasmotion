"use client";

import { Player } from "@remotion/player";
import React, { useEffect, useState } from "react";
import { getBrowserSupabase } from "../lib/supabase/client";
import { ScreenshotVideo } from "../remotion/compositions/ScreenshotVideo";
import { CAMERA_PRESET_NAMES, type CameraPresetName } from "../remotion/types/screenshot-video";
import type { RenderStatus } from "../types/render-job";

export default function PreviewPage() {
  const [screenshotUrl, setScreenshotUrl] = useState(
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=1950&fit=crop"
  );
  const [presetName, setPresetName] = useState<CameraPresetName>("zelios-style");
  const [durationInFrames, setDurationInFrames] = useState(150);
  
  const [isRendering, setIsRendering] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<RenderStatus | null>(null);
  const [s3VideoUrl, setS3VideoUrl] = useState<string | null>(null);

  // Setup Supabase Realtime Subscription when a job is running
  useEffect(() => {
    if (!jobId) return;

    let supabase;
    try {
      supabase = getBrowserSupabase();
    } catch (e) {
      console.warn("Supabase env vars missing. Skipping realtime updates.");
      return;
    }

    console.log(`[Realtime] Subscribing to job: ${jobId}`);
    
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
          console.log("[Realtime] Job Update received:", payload.new);
          const newStatus = payload.new.status as RenderStatus;
          setJobStatus(newStatus);
          
          if (newStatus === "done" && payload.new.s3_video_url) {
            setS3VideoUrl(payload.new.s3_video_url);
            setIsRendering(false);
          } else if (newStatus === "failed") {
            alert(`Rendering failed: ${payload.new.error_details}`);
            setIsRendering(false);
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`[Realtime] Unsubscribing from job: ${jobId}`);
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const handleRender = async () => {
    setIsRendering(true);
    setJobId(null);
    setJobStatus("queued");
    setS3VideoUrl(null);
    try {
      const res = await fetch("/api/render/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          props: { screenshotUrl, presetName, durationInFrames },
        }),
      });

      if (!res.ok) {
        throw new Error("Fehler beim Starten des Render-Jobs");
      }

      const data = await res.json();
      setJobId(data.jobId);
      setJobStatus(data.status);
    } catch (err: any) {
      alert(err.message);
      setIsRendering(false);
      setJobStatus(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-100 font-sans">
      {/* LEFT: Sidebar / Settings */}
      <aside className="w-96 flex-shrink-0 border-r border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">SaaMotion</h1>
          <p className="text-sm text-neutral-400">
            Cinematic 3D videos from a single screenshot.
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-grow">
          {/* Screenshot URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="screenshotUrl" className="text-sm font-medium text-neutral-300">
              Screenshot URL
            </label>
            <input
              id="screenshotUrl"
              type="text"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Camera Preset */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="presetName" className="text-sm font-medium text-neutral-300">
              Kamera-Preset
            </label>
            <select
              id="presetName"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value as CameraPresetName)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CAMERA_PRESET_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="durationInFrames" className="text-sm font-medium text-neutral-300">
              Dauer (in Frames, 30 FPS)
            </label>
            <input
              id="durationInFrames"
              type="number"
              min="30"
              max="600"
              value={durationInFrames}
              onChange={(e) => setDurationInFrames(parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-neutral-800">
          <button
            onClick={handleRender}
            disabled={isRendering}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering ? "Rendert..." : "Rendern via SQS"}
          </button>
          
          {jobId && (
            <div className="rounded-md bg-neutral-800/50 border border-neutral-700 p-3 flex flex-col gap-2">
              <div className="text-sm text-neutral-300 flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-blue-400 capitalize">{jobStatus}</span>
              </div>
              <div className="text-xs text-neutral-500 font-mono">ID: {jobId.split("-")[0]}...</div>
              
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

      {/* RIGHT: Remotion Player */}
      <main className="flex flex-1 items-center justify-center p-8 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-neutral-950">
        <div className="rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl bg-black">
          <Player
            component={ScreenshotVideo}
            inputProps={{
              screenshotUrl,
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
