import { fixTimelineAxisPosition, isTimelineDiagram } from "@/lib/mermaid/fix-timeline-layout";
import { getMermaidInitializeOptions } from "@/lib/mermaid/mermaid-init-config";
import { normalizeMindmapRootLabel } from "@/lib/mermaid/normalize-mindmap-root-label";
import { svgToPngDataUrl } from "@/lib/mermaid/svg-to-png-browser";

export async function renderMermaidToSvgInBrowser(
  code: string,
  rootLabel?: string | null,
): Promise<string | null> {
  const trimmed = normalizeMindmapRootLabel(code.trim(), rootLabel);
  if (!trimmed) return null;

  try {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize(getMermaidInitializeOptions());

    const renderId = `inclusia-export-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { svg } = await mermaid.render(renderId, trimmed);

    if (isTimelineDiagram(trimmed)) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, "image/svg+xml");
      const svgEl = doc.documentElement;
      if (svgEl instanceof SVGSVGElement) {
        fixTimelineAxisPosition(svgEl);
        return new XMLSerializer().serializeToString(svgEl);
      }
    }

    return svg;
  } catch (err) {
    console.warn("[renderMermaidToSvgInBrowser]", err);
    return null;
  }
}

export async function renderMermaidToPngInBrowser(
  code: string,
  rootLabel?: string | null,
): Promise<string | null> {
  const svg = await renderMermaidToSvgInBrowser(code, rootLabel);
  if (!svg) return null;
  return svgToPngDataUrl(svg);
}
