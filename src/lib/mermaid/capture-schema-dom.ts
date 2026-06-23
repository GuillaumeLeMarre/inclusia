import {
  prepareMermaidSvgForRasterization,
  svgLabelsAreReady,
} from "@/lib/mermaid/prepare-mermaid-svg-for-rasterization";

function serializeSvgElement(svg: SVGSVGElement): string | null {
  if (!svg.querySelector("*")) return null;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  const serialized = new XMLSerializer().serializeToString(clone);
  return prepareMermaidSvgForRasterization(serialized, svg);
}

function findSchemaSvgElement(): SVGSVGElement | null {
  if (typeof document === "undefined") return null;

  const exportSvg = document.querySelector(
    "[data-export-schema-root] [data-testid='mermaid-diagram'] svg",
  );
  if (exportSvg instanceof SVGSVGElement) return exportSvg;

  const diagrams = document.querySelectorAll("[data-testid='mermaid-diagram'] svg");
  if (diagrams.length === 0) return null;
  return diagrams[diagrams.length - 1] as SVGSVGElement;
}

export function captureSchemaSvgFromDom(): string | null {
  const svg = findSchemaSvgElement();
  if (!svg || !svgLabelsAreReady(svg)) return null;
  return serializeSvgElement(svg);
}

export async function waitForSchemaSvgFromDom(timeoutMs = 20_000): Promise<string | null> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const svg = findSchemaSvgElement();
    if (svg && svgLabelsAreReady(svg)) {
      const serialized = serializeSvgElement(svg);
      if (serialized) return serialized;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}
