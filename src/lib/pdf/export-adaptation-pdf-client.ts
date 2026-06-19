import {
  captureSchemaSvgFromDom,
  waitForSchemaSvgFromDom,
} from "@/lib/mermaid/capture-schema-dom";
import { renderMermaidToPngInBrowser, renderMermaidToSvgInBrowser } from "@/lib/mermaid/render-mermaid-browser";
import { svgToPngDataUrl } from "@/lib/mermaid/svg-to-png-browser";

interface DownloadAdaptationPdfOptions {
  schemaMermaidCode?: string | null;
  fetchSchemaIfMissing?: boolean;
  filenamePrefix?: string;
  endpoint?: string;
}

interface SchemaImagePayload {
  schemaPng?: string;
  schemaSvg?: string;
}

async function fetchSchemaMermaidCode(adaptationId: string): Promise<string | null> {
  const res = await fetch("/api/mindmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adaptationId }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.warn("[exportAdaptationPdf] /api/mindmap:", data.error ?? res.status);
    return null;
  }
  if (typeof data.mermaidCode !== "string") return null;
  return data.mermaidCode.trim() || null;
}

async function svgToExportPayload(svg: string): Promise<SchemaImagePayload | null> {
  const schemaPng = await svgToPngDataUrl(svg);
  if (schemaPng) return { schemaPng };
  return { schemaSvg: svg };
}

async function resolveSchemaImagePayload(
  adaptationId: string,
  schemaMermaidCode?: string | null,
  fetchSchemaIfMissing = true,
): Promise<SchemaImagePayload | null> {
  const domSvg = captureSchemaSvgFromDom() ?? await waitForSchemaSvgFromDom();
  if (domSvg) {
    const fromDom = await svgToExportPayload(domSvg);
    if (fromDom) return fromDom;
  }

  let mermaidCode = schemaMermaidCode?.trim() || null;
  if (!mermaidCode && fetchSchemaIfMissing) {
    mermaidCode = await fetchSchemaMermaidCode(adaptationId);
  }
  if (!mermaidCode) return null;

  const renderedSvg = await renderMermaidToSvgInBrowser(mermaidCode);
  if (renderedSvg) {
    const fromRender = await svgToExportPayload(renderedSvg);
    if (fromRender) return fromRender;
  }

  const schemaPng = await renderMermaidToPngInBrowser(mermaidCode);
  if (schemaPng) return { schemaPng };

  return null;
}

export async function downloadAdaptationPdf(
  adaptationId: string,
  options: DownloadAdaptationPdfOptions = {},
): Promise<void> {
  const schemaImage = await resolveSchemaImagePayload(
    adaptationId,
    options.schemaMermaidCode,
    options.fetchSchemaIfMissing !== false,
  );

  const expectedSchema = Boolean(options.schemaMermaidCode?.trim());
  if (expectedSchema && !schemaImage) {
    console.warn("[exportAdaptationPdf] Schéma attendu mais image non produite.");
  }

  const res = await fetch(options.endpoint ?? "/api/adaptations/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      adaptationId,
      schemaPng: schemaImage?.schemaPng,
      schemaSvg: schemaImage?.schemaSvg,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Export échoué");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${options.filenamePrefix ?? "cours-adapte"}-${adaptationId.slice(0, 8)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
