import React from "react";
import { useVideoConfig } from "remotion";
import type { BackgroundStyleId } from "../art-direction/catalog";
import type { TextPresetId } from "../text-presets/catalog";
import {
  computeSublineEnter,
  computeTextEnter,
  computeTextExit,
} from "../text-presets/compute";
import { SAAS_FONT_FAMILY } from "../constants/typography";
import { computeSceneTypographyLayout } from "../lib/scene-layout";
import { StaggeredWords } from "./kinetic/StaggeredWords";
import { ChatBubbleStack } from "./kinetic/ChatBubbleStack";
import { KineticTimeline } from "./kinetic/KineticTimeline";

interface SceneHeadlineProps {
  readonly headline: string;
  readonly subline: string;
  readonly localFrame: number;
  readonly localDuration: number;
  readonly textPreset: TextPresetId;
  readonly background?: BackgroundStyleId;
}

export const SceneHeadline: React.FC<SceneHeadlineProps> = ({
  headline,
  subline,
  localFrame,
  localDuration,
  textPreset,
  background = "solid-dark",
}) => {
  const { width, height } = useVideoConfig();
  const layout = computeSceneTypographyLayout(width, height, background);

  const enter = computeTextEnter(textPreset, localFrame, { width, height });
  const exit = computeTextExit(localFrame, localDuration);
  const sublineOpacity = computeSublineEnter(localFrame);

  if (!headline && !subline) {
    return null;
  }

  const headlineOpacity = enter.opacity * exit.opacity;
  const headlineTransform = [
    `translateX(${enter.translateX}px)`,
    `translateY(${enter.translateY + exit.translateY}px)`,
    `scale(${enter.scale})`,
  ].join(" ");

  const isKinetic = textPreset.startsWith("kinetic-");
  const bandHeight = Math.round(height * layout.textBandRatio);

  const contentAlign =
    textPreset === "kinetic-timeline" ? ("flex-start" as const) : ("center" as const);

  return (
    <>
      {layout.scrim && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: bandHeight,
            ...(layout.textPlacement === "top" ? { top: 0 } : { bottom: 0 }),
            pointerEvents: "none",
            zIndex: 18,
            background:
              layout.textPlacement === "bottom"
                ? layout.scrim.replace("180deg", "0deg")
                : layout.scrim,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          ...(layout.textPlacement === "bottom"
            ? { bottom: layout.edgeInset, left: 0, right: 0 }
            : { top: layout.edgeInset, left: 0, right: 0 }),
          padding: `0 ${layout.paddingX}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: contentAlign,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: layout.maxTextWidth,
            margin: contentAlign === "center" ? "0 auto" : undefined,
            textAlign: textPreset === "kinetic-timeline" ? "left" : "center",
            fontFamily: SAAS_FONT_FAMILY,
            // Solid plate so copy never sits illegibly on light app UI
            backgroundColor:
              background === "solid-white"
                ? "rgba(255,255,255,0.92)"
                : "rgba(5,6,10,0.78)",
            borderRadius: Math.round(layout.headlineSize * 0.35),
            padding: `${Math.round(layout.gapY * 1.4)}px ${Math.round(layout.paddingX * 0.45)}px`,
            boxShadow:
              background === "solid-white"
                ? "0 8px 32px rgba(0,0,0,0.12)"
                : "0 12px 40px rgba(0,0,0,0.45)",
          }}
        >
          {isKinetic ? (
            <div
              style={{
                opacity: exit.opacity,
                transform: `translateY(${exit.translateY}px)`,
                fontSize: layout.headlineSize,
                fontWeight: 600,
                color: layout.headlineColor,
                textShadow: layout.textShadow,
                display: "flex",
                flexDirection: "column",
                alignItems: contentAlign,
                gap: layout.gapY,
              }}
            >
              {textPreset === "kinetic-timeline" && (
                <KineticTimeline
                  headline={headline}
                  subline={subline}
                  localFrame={localFrame}
                />
              )}
              {textPreset === "kinetic-pills" && (
                <StaggeredWords
                  text={headline}
                  localFrame={localFrame}
                  variant="pills"
                />
              )}
              {textPreset === "kinetic-words" && (
                <StaggeredWords
                  text={headline}
                  localFrame={localFrame}
                  variant="words"
                />
              )}
              {textPreset === "kinetic-chat" && (
                <ChatBubbleStack
                  lines={[headline, subline].filter(Boolean)}
                  localFrame={localFrame}
                />
              )}
              {textPreset === "kinetic-words" && subline ? (
                <p
                  style={{
                    margin: 0,
                    color: layout.sublineColor,
                    fontSize: layout.sublineSize,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.35,
                    opacity: sublineOpacity,
                    textShadow: layout.textShadow,
                    maxWidth: layout.maxTextWidth,
                  }}
                >
                  {subline}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              {headline && (
                <h2
                  style={{
                    margin: 0,
                    color: layout.headlineColor,
                    fontSize: layout.headlineSize,
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    opacity: headlineOpacity,
                    transform: headlineTransform,
                    filter: enter.filter,
                    clipPath: enter.clipPath,
                    fontFamily: SAAS_FONT_FAMILY,
                    textShadow: layout.textShadow,
                    maxWidth: layout.maxTextWidth,
                    overflowWrap: "break-word",
                  }}
                >
                  {headline}
                </h2>
              )}
              {subline && (
                <p
                  style={{
                    margin: `${layout.gapY}px 0 0`,
                    color: layout.sublineColor,
                    fontSize: layout.sublineSize,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.4,
                    opacity: sublineOpacity * exit.opacity,
                    transform: `translateY(${exit.translateY}px)`,
                    fontFamily: SAAS_FONT_FAMILY,
                    textShadow: layout.textShadow,
                    maxWidth: layout.maxTextWidth,
                    overflowWrap: "break-word",
                  }}
                >
                  {subline}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
