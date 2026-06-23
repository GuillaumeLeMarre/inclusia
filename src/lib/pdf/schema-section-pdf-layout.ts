import type { jsPDF } from "jspdf";
import type { InlineSpan, MarkdownBlock } from "@/lib/pdf/parse-markdown-for-pdf";
import type { SchemaPdfAsset } from "@/lib/pdf/schema-pdf-image";

export interface SchemaSectionLayoutTheme {
  margin: number;
  maxWidth: number;
  bodyLineHeight: number;
  paragraphGap: number;
  headingSizes: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  headingGap: Record<1 | 2 | 3 | 4 | 5 | 6, { before: number; after: number }>;
}

interface LayoutContext {
  doc: jsPDF;
  theme: SchemaSectionLayoutTheme;
  y: number;
}

function spansToPlainText(spans: InlineSpan[]): string {
  return spans.map((span) => span.text).join("");
}

function isSchemaHeading(block: MarkdownBlock): boolean {
  if (block.type !== "heading") return false;
  const text = spansToPlainText(block.spans).trim().toLowerCase();
  return text === "schéma" || text === "schema" || text.startsWith("schéma ");
}

function findSchemaBlockIndex(blocks: MarkdownBlock[], fromIndex: number): number | null {
  for (let j = fromIndex + 1; j < blocks.length; j += 1) {
    const block = blocks[j]!;
    if (block.type === "schema") return j;
    if (block.type === "heading" || block.type === "hr") break;
    if (block.type === "paragraph" || block.type === "blockquote") continue;
    break;
  }
  return null;
}

function resolveSchemaGroupStart(blocks: MarkdownBlock[], schemaIndex: number): number {
  let start = schemaIndex;
  for (let j = schemaIndex - 1; j >= 0; j -= 1) {
    const block = blocks[j]!;
    if (block.type === "paragraph" || block.type === "blockquote") {
      start = j;
      continue;
    }
    if (block.type === "heading" && isSchemaHeading(block)) {
      start = j;
      break;
    }
    break;
  }
  return start;
}

function getSchemaSectionGroup(
  blocks: MarkdownBlock[],
  index: number,
): { start: number; end: number } | null {
  const block = blocks[index]!;

  if (block.type === "heading" && isSchemaHeading(block)) {
    const schemaIndex = findSchemaBlockIndex(blocks, index);
    if (schemaIndex !== null) return { start: index, end: schemaIndex };
  }

  if (block.type === "schema") {
    return { start: resolveSchemaGroupStart(blocks, index), end: index };
  }

  if (block.type === "paragraph" || block.type === "blockquote") {
    const schemaIndex = findSchemaBlockIndex(blocks, index);
    if (schemaIndex !== null && schemaIndex === index + 1) {
      return { start: resolveSchemaGroupStart(blocks, schemaIndex), end: schemaIndex };
    }
  }

  return null;
}

export function getSchemaSectionGroupStartIndex(
  blocks: MarkdownBlock[],
  index: number,
): number | null {
  const group = getSchemaSectionGroup(blocks, index);
  if (!group || group.start !== index) return null;
  return group.start;
}

function estimateHeadingBlockHeight(
  ctx: LayoutContext,
  block: Extract<MarkdownBlock, { type: "heading" }>,
): number {
  const size = ctx.theme.headingSizes[block.level];
  const gap = ctx.theme.headingGap[block.level];
  const lineHeight = size * 1.25;
  const text = spansToPlainText(block.spans);
  const lines = ctx.doc.splitTextToSize(text, ctx.theme.maxWidth) as string[];
  return gap.before + lines.length * lineHeight + gap.after;
}

function estimateParagraphBlockHeight(
  ctx: LayoutContext,
  block: Extract<MarkdownBlock, { type: "paragraph" | "blockquote" }>,
): number {
  const text = spansToPlainText(block.spans);
  const lines = ctx.doc.splitTextToSize(text, ctx.theme.maxWidth) as string[];
  const extra = block.type === "blockquote" ? 8 : ctx.theme.paragraphGap * 0.5;
  return lines.length * ctx.theme.bodyLineHeight + extra;
}

export function estimateSchemaBlockHeight(
  ctx: LayoutContext,
  block: Extract<MarkdownBlock, { type: "schema" }>,
  schemaAsset: SchemaPdfAsset | null,
): number {
  let height = ctx.theme.bodyLineHeight * 2;

  if (block.label && block.label !== "Schéma du cours") {
    height += ctx.theme.bodyLineHeight + ctx.theme.paragraphGap * 0.25;
  }

  if (schemaAsset) {
    height += schemaAsset.heightPt + 12 + ctx.theme.paragraphGap;
  } else {
    height += ctx.theme.bodyLineHeight + ctx.theme.paragraphGap * 0.35;
  }

  return height;
}

function estimateSchemaSectionHeight(
  ctx: LayoutContext,
  blocks: MarkdownBlock[],
  start: number,
  end: number,
  schemaAsset: SchemaPdfAsset | null,
): number {
  let total = 0;

  for (let i = start; i <= end; i += 1) {
    const block = blocks[i]!;
    switch (block.type) {
      case "heading":
        total += estimateHeadingBlockHeight(ctx, block);
        break;
      case "paragraph":
      case "blockquote":
        total += estimateParagraphBlockHeight(ctx, block);
        break;
      case "schema":
        total += estimateSchemaBlockHeight(ctx, block, schemaAsset);
        break;
      default:
        break;
    }
  }

  return total;
}

export function ensureSchemaSectionFitsOnPage(
  doc: jsPDF,
  theme: SchemaSectionLayoutTheme,
  y: number,
  pageHeight: number,
  blocks: MarkdownBlock[],
  index: number,
  schemaAsset: SchemaPdfAsset | null,
): number {
  const group = getSchemaSectionGroup(blocks, index);
  if (!group || group.start !== index) return y;

  const ctx: LayoutContext = { doc, theme, y };
  const needed = estimateSchemaSectionHeight(ctx, blocks, group.start, group.end, schemaAsset);
  const remaining = pageHeight - theme.margin - y;

  if (needed > remaining) {
    doc.addPage();
    return theme.margin;
  }

  return y;
}
