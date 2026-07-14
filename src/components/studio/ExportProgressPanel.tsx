"use client";

import React, { useEffect, useState } from "react";
import type { RenderStatus } from "../../types/render-job";

export type ExportPhase = "idle" | "script" | "queued" | "rendering" | "done" | "failed";

interface ExportProgressPanelProps {
  readonly phase: ExportPhase;
  readonly jobStatus: RenderStatus | null;
  readonly sceneCount: number;
  readonly durationSeconds: number;
  readonly videoUrl: string | null;
  readonly errorMessage?: string | null;
  readonly onReset?: () => void;
}

function estimateSeconds(sceneCount: number, durationSeconds: number): number {
  return 25 + sceneCount * 35 + durationSeconds * 4;
}

function phaseLabel(phase: ExportPhase, jobStatus: RenderStatus | null): string {
  if (phase === "script") return "AI is writing your script…";
  if (phase === "queued" || jobStatus === "queued") return "Job queued — waiting for render worker…";
  if (phase === "rendering" || jobStatus === "rendering") return "Rendering cinematic video…";
  if (phase === "done") return "Your video is ready";
  if (phase === "failed") return "Export failed";
  return "";
}

function stepState(
  step: "script" | "queue" | "render" | "done",
  phase: ExportPhase,
  jobStatus: RenderStatus | null,
): "pending" | "active" | "done" {
  const order = ["script", "queue", "render", "done"] as const;
  const current =
    phase === "script"
      ? "script"
      : phase === "queued" || jobStatus === "queued"
        ? "queue"
        : phase === "rendering" || jobStatus === "rendering"
          ? "render"
          : phase === "done"
            ? "done"
            : phase === "failed"
              ? "render"
              : "script";

  const stepIdx = order.indexOf(step);
  const currentIdx = order.indexOf(current);

  if (phase === "done" && step !== "done") return "done";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export const ExportProgressPanel: React.FC<ExportProgressPanelProps> = ({
  phase,
  jobStatus,
  sceneCount,
  durationSeconds,
  videoUrl,
  errorMessage,
  onReset,
}) => {
  const [progress, setProgress] = useState(8);
  const etaSeconds = estimateSeconds(sceneCount, durationSeconds);

  useEffect(() => {
    if (phase === "idle") {
      setProgress(0);
      return;
    }
    if (phase === "done") {
      setProgress(100);
      return;
    }
    if (phase === "failed") return;

    const targets: Record<ExportPhase, number> = {
      idle: 0,
      script: 22,
      queued: 32,
      rendering: 88,
      done: 100,
      failed: progress,
    };

    const target = targets[phase];
    const interval = setInterval(() => {
      setProgress((p) => {
        if (phase === "rendering" && p >= 88) return Math.min(p + 0.15, 94);
        if (p >= target) return p;
        return Math.min(p + 1.2, target);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [phase]);

  if (phase === "idle") return null;

  const label = phaseLabel(phase, jobStatus);
  const remaining = Math.max(0, Math.round((etaSeconds * (100 - progress)) / 100));

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0e14]/95 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Export</p>
        <h2 className="mt-2 text-xl font-medium tracking-tight text-white">{label}</h2>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-white transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
          <span>{Math.round(progress)}%</span>
          {phase !== "done" && phase !== "failed" && (
            <span>~{remaining < 60 ? `${remaining}s` : `${Math.ceil(remaining / 60)} min`} remaining</span>
          )}
        </div>

        <ol className="mt-8 flex flex-col gap-3">
          {(
            [
              ["script", "Write script with AI"],
              ["queue", "Send to render queue"],
              ["render", "Render 3D video on server"],
              ["done", "Download MP4"],
            ] as const
          ).map(([key, text]) => {
            const state = stepState(key, phase, jobStatus);
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    state === "done"
                      ? "bg-white text-black"
                      : state === "active"
                        ? "border border-white/30 text-white"
                        : "border border-white/10 text-zinc-600"
                  }`}
                >
                  {state === "done" ? "✓" : state === "active" ? "•" : ""}
                </span>
                <span
                  className={
                    state === "active"
                      ? "text-white"
                      : state === "done"
                        ? "text-zinc-400"
                        : "text-zinc-600"
                  }
                >
                  {text}
                </span>
              </li>
            );
          })}
        </ol>

        {phase === "done" && videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Download video
          </a>
        )}

        {phase === "failed" && (
          <div className="mt-6">
            <p className="text-sm text-red-400">{errorMessage ?? "Something went wrong."}</p>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="mt-4 text-[11px] uppercase tracking-wider text-zinc-400 hover:text-white"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
