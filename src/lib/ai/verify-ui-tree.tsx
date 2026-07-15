import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { UIElement, UIReconstruction } from "../../types/ui-reconstruction";

let fontData: ArrayBuffer | null = null;

async function getFont() {
  if (!fontData) {
    // Inter Regular
    const res = await fetch(
      "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Regular.woff"
    );
    fontData = await res.arrayBuffer();
  }
  return fontData;
}

function renderElement(element: UIElement): React.ReactNode {
  return (
    <div
      key={element.id}
      style={{
        position: "absolute",
        left: `${element.bounds.x}%`,
        top: `${element.bounds.y}%`,
        width: `${element.bounds.width}%`,
        height: `${element.bounds.height}%`,
        backgroundColor: element.style?.backgroundColor,
        color: element.style?.color,
        fontSize: element.style?.fontSize,
        fontWeight: element.style?.fontWeight,
        borderRadius: element.style?.borderRadius,
        opacity: element.style?.opacity ?? 1,
        border:
          element.style?.borderWidth && element.style?.borderColor
            ? `${element.style.borderWidth}px solid ${element.style.borderColor}`
            : undefined,
        display: "flex",
        alignItems: element.type === "text" ? "flex-start" : "center",
        justifyContent: element.type === "text" ? "flex-start" : "center",
        boxSizing: "border-box",
        padding: element.type === "text" ? "2px 4px" : undefined,
        whiteSpace: element.type === "text" ? "pre-wrap" : undefined,
        overflow: "hidden",
      }}
    >
      {element.type === "progress" && (
        <div
          style={{
            width: `${Math.min(100, Math.max(0, Number.parseFloat(element.content || "50")))}%`,
            height: "100%",
            backgroundColor: element.style?.color ?? "#8b5cf6",
            borderRadius: element.style?.borderRadius ?? 4,
          }}
        />
      )}
      {element.content && element.type !== "container" && element.type !== "progress" && (
        <span style={{ width: "100%", textAlign: "inherit" }}>{element.content}</span>
      )}
      {element.children?.map(renderElement)}
    </div>
  );
}

export async function renderUITreeToPng(uiTree: UIReconstruction): Promise<Buffer> {
  const font = await getFont();

  const svg = await satori(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: uiTree.backgroundColor,
        display: "flex",
        overflow: "hidden",
      }}
    >
      {renderElement(uiTree.root)}
    </div>,
    {
      width: uiTree.width,
      height: uiTree.height,
      fonts: [
        {
          name: "Inter",
          data: font,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    background: uiTree.backgroundColor,
    fitTo: {
      mode: "width",
      value: Math.min(uiTree.width, 1200), // scale down to save token bandwidth
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
