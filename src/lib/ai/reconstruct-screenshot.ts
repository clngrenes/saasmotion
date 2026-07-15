import { generateObject } from "ai";
import { z } from "zod";
import type { UIReconstruction } from "../../types/ui-reconstruction";
import { UI_ELEMENT_TYPES } from "../../types/ui-reconstruction";
import { scriptModel } from "./google";
import { renderUITreeToPng } from "./verify-ui-tree";

const boundsSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0.5).max(100),
  height: z.number().min(0.5).max(100),
});

const styleSchema = z
  .object({
    backgroundColor: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.number().min(8).max(72).optional(),
    fontWeight: z.number().min(100).max(900).optional(),
    borderRadius: z.number().min(0).max(48).optional(),
    opacity: z.number().min(0).max(1).optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().min(0).max(8).optional(),
  })
  .optional();

type UIElementSchema = {
  id: string;
  type: (typeof UI_ELEMENT_TYPES)[number];
  bounds: z.infer<typeof boundsSchema>;
  style?: z.infer<typeof styleSchema>;
  content?: string;
  children?: UIElementSchema[];
};

const uiElementSchema: z.ZodType<UIElementSchema> = z.lazy(() =>
  z.object({
    id: z.string().min(1).max(40),
    type: z.enum(UI_ELEMENT_TYPES),
    bounds: boundsSchema,
    style: styleSchema,
    content: z.string().max(500).optional(),
    children: z.array(uiElementSchema).max(24).optional(),
  }),
);

const reconstructionSchema = z.object({
  width: z.number().min(320).max(4096),
  height: z.number().min(320).max(4096),
  backgroundColor: z.string(),
  root: uiElementSchema,
  focusableIds: z.array(z.string()).min(1).max(12),
});

function collectIds(node: UIElementSchema): string[] {
  const ids = [node.id];
  for (const child of node.children ?? []) {
    ids.push(...collectIds(child));
  }
  return ids;
}

function normalizeTree(raw: z.infer<typeof reconstructionSchema>): UIReconstruction {
  const allIds = new Set(collectIds(raw.root));
  const focusableIds = raw.focusableIds.filter((id) => allIds.has(id));

  return {
    version: 1,
    width: raw.width,
    height: raw.height,
    backgroundColor: raw.backgroundColor,
    root: raw.root,
    focusableIds: focusableIds.length > 0 ? focusableIds : [raw.root.id],
  };
}

export async function reconstructScreenshot(input: {
  screenshotUrl: string;
  screenshotName?: string;
  maxPasses?: number;
}): Promise<UIReconstruction> {
  const maxPasses = input.maxPasses ?? 2;

  // PASS 1: Initial Structural Reconstruction
  let { object: currentTree } = await generateObject({
    model: scriptModel,
    schema: reconstructionSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You rebuild mobile/web UI screenshots as a structured layer tree for programmatic video animation.

GOAL: 1:1 visual fidelity — every visible region becomes a real element with exact bounds, colors, typography, and text content.

RULES:
- Use percentage bounds (0–100) relative to the screenshot canvas
- Root is a "container" covering the full screen (0,0,100,100)
- Nest children for cards, lists, nav bars, modals — NOT one flat list
- Extract exact text content where readable (headlines, labels, numbers)
- Match backgroundColor, text colors, borderRadius from the screenshot
- focusableIds = distinct UI blocks worth animating (cards, modals, CTAs, charts) — NOT every text line
- Prefer semantic types: card, button, progress, list-item, icon-row, text, image, container
- Do NOT invent elements that aren't visible
- Dark theme apps: use exact hex colors from the screenshot

Screenshot: ${input.screenshotName ?? "upload"}`,
          },
          {
            type: "image",
            image: input.screenshotUrl,
          },
        ],
      },
    ],
  });

  if (maxPasses <= 1) {
    return normalizeTree(currentTree);
  }

  // PASS 2: Visual Verification Loop (imugi / one-shot-ui style)
  for (let pass = 2; pass <= maxPasses; pass++) {
    const pngBuffer = await renderUITreeToPng(normalizeTree(currentTree));
    const renderedBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;

    const { object: refinedTree } = await generateObject({
      model: scriptModel,
      schema: reconstructionSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Here is the ORIGINAL target screenshot:",
            },
            {
              type: "image",
              image: input.screenshotUrl,
            },
            {
              type: "text",
              text: "Here is the RENDERED IMAGE of your previous JSON output. It is not pixel-perfect yet.",
            },
            {
              type: "image",
              image: renderedBase64,
            },
            {
              type: "text",
              text: `Please compare the two images carefully. Find all discrepancies in:
1. Missing elements (were any cards, texts, or icons left out?)
2. Colors (are the hex codes exactly matching the original?)
3. Alignment and Bounds (are the x, y, width, height percentages correct?)
4. Corner Radii and borders

Output the CORRECTED complete JSON layer tree to achieve a 100% pixel-perfect match. Ensure focusableIds still points to the main animatable blocks.`,
            },
          ],
        },
      ],
    });

    currentTree = refinedTree;
  }

  return normalizeTree(currentTree);
}
