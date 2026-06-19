import { fixTimelineAxisPosition, isTimelineDiagram } from "@/lib/mermaid/fix-timeline-layout";
import { svgToPngDataUrl } from "@/lib/mermaid/svg-to-png-browser";

function getMermaidTheme(): "default" | "dark" {
  if (typeof window === "undefined") return "default";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
}

export async function renderMermaidToSvgInBrowser(code: string): Promise<string | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;

  try {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      theme: getMermaidTheme(),
      securityLevel: "loose",
      fontFamily: "Helvetica, Arial, sans-serif",
    });

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

export async function renderMermaidToPngInBrowser(code: string): Promise<string | null> {
  const svg = await renderMermaidToSvgInBrowser(code);
  if (!svg) return null;
  return svgToPngDataUrl(svg);
}
