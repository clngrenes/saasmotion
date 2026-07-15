/** Percentage-based bounds (0–100) relative to the screenshot canvas */
export type UIElementBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export const UI_ELEMENT_TYPES = [
  "container",
  "text",
  "button",
  "card",
  "image",
  "progress",
  "icon-row",
  "list-item",
] as const;

export type UIElementType = (typeof UI_ELEMENT_TYPES)[number];

export type UIElementStyle = {
  readonly backgroundColor?: string;
  readonly color?: string;
  readonly fontSize?: number;
  readonly fontWeight?: number;
  readonly borderRadius?: number;
  readonly opacity?: number;
  readonly borderColor?: string;
  readonly borderWidth?: number;
};

export type UIElement = {
  readonly id: string;
  readonly type: UIElementType;
  readonly bounds: UIElementBounds;
  readonly style?: UIElementStyle;
  readonly content?: string;
  readonly children?: readonly UIElement[];
};

export type UIReconstruction = {
  readonly version: 1;
  readonly width: number;
  readonly height: number;
  readonly backgroundColor: string;
  readonly root: UIElement;
  /** Element IDs the motion director can focus — real layers, no crop/dim */
  readonly focusableIds: readonly string[];
  readonly matchScore?: number;
};

export type ReconstructedScene = {
  readonly screenshotUrl: string;
  readonly uiTree: UIReconstruction;
  readonly focusElementId?: string;
};
