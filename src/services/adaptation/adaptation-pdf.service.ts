import { jsPDF } from "jspdf";
import { parseMarkdownBlocks } from "@/lib/pdf/parse-markdown-for-pdf";
import {
  buildMarkdownPdfTheme,
  renderMarkdownBlocksToPdf,
} from "@/lib/pdf/markdown-pdf-renderer";
import { prepareSchemaPdfAssetFromPng, prepareSchemaPdfAssetFromSvg } from "@/lib/pdf/schema-pdf-image";
import type { MermaidGenerationResult } from "@/types/mindmap";

export interface AdaptationPdfOptions {
  falcMode?: boolean;
  footerLabel?: string;
  schema?: MermaidGenerationResult | null;
  schemaPng?: string | null;
  schemaSvg?: string | null;
}

function wrapLine(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

function ensureSchemaBlock(
  blocks: ReturnType<typeof parseMarkdownBlocks>,
  options: {
    schema?: MermaidGenerationResult | null;
    schemaPng?: string | null;
    schemaSvg?: string | null;
  },
) {
  if (blocks.some((block) => block.type === "schema")) return blocks;

  const hasImage =
    Boolean(options.schemaPng?.startsWith("data:image/png"))
    || Boolean(options.schemaSvg?.includes("<svg"));
  const hasSchemaMeta = Boolean(options.schema?.mermaidCode?.trim());

  if (!hasImage && !hasSchemaMeta) return blocks;

  return [
    ...blocks,
    {
      type: "schema" as const,
      label: options.schema?.title || "Schéma du cours",
    },
  ];
}

async function resolveSchemaAsset(
  options: AdaptationPdfOptions,
  maxWidthPt: number,
) {
  if (options.schemaPng) {
    const fromPng = await prepareSchemaPdfAssetFromPng(options.schemaPng, maxWidthPt);
    if (fromPng) return fromPng;
  }

  if (options.schemaSvg) {
    return prepareSchemaPdfAssetFromSvg(options.schemaSvg, maxWidthPt);
  }

  return null;
}

export async function buildAdaptationPdfBuffer(
  title: string,
  content: string,
  options: AdaptationPdfOptions = {},
): Promise<Buffer> {
  const falcMode = options.falcMode ?? false;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const theme = buildMarkdownPdfTheme(doc, falcMode, margin);
  const titleSize = falcMode ? 22 : 20;
  const titleLineHeight = falcMode ? 32 : 28;

  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleSize);
  wrapLine(doc, title, theme.maxWidth).forEach((line) => {
    doc.text(line, margin, y);
    y += titleLineHeight;
  });

  y += 16;

  const schemaAsset = await resolveSchemaAsset(options, theme.maxWidth);

  const blocks = ensureSchemaBlock(parseMarkdownBlocks(content), {
    schema: options.schema,
    schemaPng: options.schemaPng,
    schemaSvg: options.schemaSvg,
  });
  if (blocks.length > 0) {
    renderMarkdownBlocksToPdf(doc, blocks, theme, y, schemaAsset);
  }

  const footer =
    options.footerLabel
    ?? (falcMode ? "Document FALC — Inclusia" : "Cours adapté — Inclusia");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(footer, margin, doc.internal.pageSize.getHeight() - 24);

  return Buffer.from(doc.output("arraybuffer"));
}

/** @deprecated Utiliser buildAdaptationPdfBuffer */
export async function buildFalcPdfBuffer(title: string, content: string): Promise<Buffer> {
  return buildAdaptationPdfBuffer(title, content, { falcMode: true });
}
