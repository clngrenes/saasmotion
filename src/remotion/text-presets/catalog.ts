export const TEXT_PRESET_CATEGORIES = [
  {
    id: "basic",
    label: "Basic",
    presets: [
      { id: "fade", label: "Fade", hint: "○" },
      { id: "blur-in", label: "Blur", hint: "◎" },
    ],
  },
  {
    id: "slide",
    label: "Slide",
    presets: [
      { id: "slide-up", label: "Slide ↑", hint: "↑" },
      { id: "slide-down", label: "Slide ↓", hint: "↓" },
      { id: "slide-left", label: "Slide ←", hint: "←" },
      { id: "slide-right", label: "Slide →", hint: "→" },
    ],
  },
  {
    id: "mask",
    label: "Mask",
    presets: [
      { id: "mask-up", label: "Mask ↑", hint: "▲" },
      { id: "mask-down", label: "Mask ↓", hint: "▼" },
    ],
  },
  {
    id: "scale",
    label: "Scale",
    presets: [
      { id: "grow", label: "Grow", hint: "+" },
      { id: "shrink", label: "Shrink", hint: "−" },
    ],
  },
  {
    id: "kinetic",
    label: "Kinetic (Pro)",
    presets: [
      { id: "kinetic-pills", label: "Pill Stagger", hint: "⊂" },
      { id: "kinetic-words", label: "Word Reveal", hint: "▤" },
      { id: "kinetic-chat", label: "Chat Stack", hint: "≡" },
      { id: "kinetic-timeline", label: "Timeline", hint: "⁞" },
    ],
  },
] as const;

export type TextPresetId =
  (typeof TEXT_PRESET_CATEGORIES)[number]["presets"][number]["id"];

export const TEXT_PRESET_IDS: readonly TextPresetId[] =
  TEXT_PRESET_CATEGORIES.flatMap((c) => c.presets.map((p) => p.id));

export const DEFAULT_TEXT_PRESET: TextPresetId = "slide-up";

export function isTextPresetId(value: string): value is TextPresetId {
  return TEXT_PRESET_IDS.includes(value as TextPresetId);
}
