import type { jsPDF } from "jspdf";
import type { InlineSpan, MarkdownBlock } from "@/lib/pdf/parse-markdown-for-pdf";
import type { SchemaPdfAsset } from "@/lib/pdf/schema-pdf-image";

export interface MarkdownPdfTheme {
  falcMode: boolean;
  margin: number;
  maxWidth: number;
  bodySize: number;
  bodyLineHeight: number;
  paragraphGap: number;
  listIndent: number;
  headingSizes: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  headingGap: Record<1 | 2 | 3 | 4 | 5 | 6, { before: number; after: number }>;
}

interface RenderContext {
  doc: jsPDF;
  theme: MarkdownPdfTheme;
  x: number;
  y: number;
}

function pageHeight(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight();
}

function ensureSpace(ctx: RenderContext, needed: number): void {
  if (ctx.y + needed <= pageHeight(ctx.doc) - ctx.theme.margin) return;
  ctx.doc.addPage();
  ctx.y = ctx.theme.margin;
}

function setSpanFont(doc: jsPDF, span: InlineSpan, size: number): void {
  if (span.code) {
    doc.setFont("courier", "normal");
  } else if (span.bold && span.italic) {
    doc.setFont("helvetica", "bolditalic");
  } else if (span.bold) {
    doc.setFont("helvetica", "bold");
  } else if (span.italic) {
    doc.setFont("helvetica", "italic");
  } else {
    doc.setFont("helvetica", "normal");
  }
  doc.setFontSize(size);
}

function renderSpans(
  ctx: RenderContext,
  spans: InlineSpan[],
  options: {
    fontSize: number;
    lineHeight: number;
    indent?: number;
    maxWidth?: number;
  },
): void {
  const indent = options.indent ?? 0;
  const maxWidth = options.maxWidth ?? ctx.theme.maxWidth - indent;
  let x = ctx.x + indent;
  const startX = ctx.x + indent;
  const lineHeight = options.lineHeight;

  for (const span of spans) {
    const words = span.text.split(/(\s+)/).filter((part) => part.length > 0);
    for (const word of words) {
      setSpanFont(ctx.doc, span, options.fontSize);
      const width = ctx.doc.getTextWidth(word);

      if (x + width > startX + maxWidth && x > startX) {
        ctx.y += lineHeight;
        ensureSpace(ctx, lineHeight);
        x = startX;
      }

      ensureSpace(ctx, lineHeight);
      ctx.doc.text(word, x, ctx.y);
      x += width;
    }
  }

  ctx.y += lineHeight;
}

function renderHeading(ctx: RenderContext, block: Extract<MarkdownBlock, { type: "heading" }>): void {
  const size = ctx.theme.headingSizes[block.level];
  const gap = ctx.theme.headingGap[block.level];
  ctx.y += gap.before;
  ensureSpace(ctx, size + gap.after);
  renderSpans(ctx, block.spans, {
    fontSize: size,
    lineHeight: size * 1.25,
  });
  ctx.y += gap.after - size * 0.25;
}

function renderList(ctx: RenderContext, items: InlineSpan[][], ordered: boolean): void {
  const bulletWidth = ctx.theme.listIndent;
  items.forEach((item, index) => {
    ensureSpace(ctx, ctx.theme.bodyLineHeight);
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(ctx.theme.bodySize);
    const marker = ordered ? `${index + 1}.` : "•";
    ctx.doc.text(marker, ctx.x, ctx.y);
    renderSpans(ctx, item, {
      fontSize: ctx.theme.bodySize,
      lineHeight: ctx.theme.bodyLineHeight,
      indent: bulletWidth,
      maxWidth: ctx.theme.maxWidth - bulletWidth,
    });
    ctx.y += ctx.theme.paragraphGap * 0.35;
  });
}

function renderSchemaBlock(
  ctx: RenderContext,
  block: Extract<MarkdownBlock, { type: "schema" }>,
  schemaAsset: SchemaPdfAsset | null,
): void {
  ensureSpace(ctx, ctx.theme.bodyLineHeight * 2);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(ctx.theme.bodySize);
  ctx.doc.text("Schéma", ctx.x, ctx.y);
  ctx.y += ctx.theme.bodyLineHeight;

  if (block.label && block.label !== "Schéma du cours") {
    renderSpans(ctx, [{ text: block.label }], {
      fontSize: ctx.theme.bodySize * 0.95,
      lineHeight: ctx.theme.bodyLineHeight * 0.9,
    });
    ctx.y += ctx.theme.paragraphGap * 0.25;
  }

  if (schemaAsset) {
    ensureSpace(ctx, schemaAsset.heightPt + 12);
    const imageData = schemaAsset.dataUrl.includes(",")
      ? schemaAsset.dataUrl.split(",")[1]!
      : schemaAsset.dataUrl;
    ctx.doc.addImage(
      imageData,
      "PNG",
      ctx.x,
      ctx.y,
      schemaAsset.widthPt,
      schemaAsset.heightPt,
    );
    ctx.y += schemaAsset.heightPt + ctx.theme.paragraphGap;
    return;
  }

  renderSpans(ctx, [{ text: block.label, italic: true }], {
    fontSize: ctx.theme.bodySize,
    lineHeight: ctx.theme.bodyLineHeight,
    indent: ctx.theme.listIndent,
  });
  ctx.y += ctx.theme.paragraphGap * 0.35;
}

export function renderMarkdownBlocksToPdf(
  doc: jsPDF,
  blocks: MarkdownBlock[],
  theme: MarkdownPdfTheme,
  startY: number,
  schemaAsset: SchemaPdfAsset | null = null,
): number {
  const ctx: RenderContext = {
    doc,
    theme,
    x: theme.margin,
    y: startY,
  };

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        renderHeading(ctx, block);
        break;
      case "paragraph":
        ensureSpace(ctx, ctx.theme.bodyLineHeight);
        renderSpans(ctx, block.spans, {
          fontSize: ctx.theme.bodySize,
          lineHeight: ctx.theme.bodyLineHeight,
        });
        ctx.y += ctx.theme.paragraphGap * 0.5;
        break;
      case "ul":
        renderList(ctx, block.items, false);
        ctx.y += ctx.theme.paragraphGap * 0.35;
        break;
      case "ol":
        renderList(ctx, block.items, true);
        ctx.y += ctx.theme.paragraphGap * 0.35;
        break;
      case "blockquote":
        ensureSpace(ctx, ctx.theme.bodyLineHeight + 8);
        ctx.doc.setDrawColor(180, 180, 180);
        ctx.doc.setLineWidth(2);
        ctx.doc.line(ctx.x + 4, ctx.y - ctx.theme.bodySize * 0.75, ctx.x + 4, ctx.y + ctx.theme.bodyLineHeight);
        renderSpans(ctx, block.spans, {
          fontSize: ctx.theme.bodySize,
          lineHeight: ctx.theme.bodyLineHeight,
          indent: 16,
          maxWidth: ctx.theme.maxWidth - 16,
        });
        ctx.y += ctx.theme.paragraphGap * 0.5;
        break;
      case "hr":
        ensureSpace(ctx, 20);
        ctx.y += 8;
        ctx.doc.setDrawColor(200, 200, 200);
        ctx.doc.setLineWidth(1);
        ctx.doc.line(ctx.x, ctx.y, ctx.x + ctx.theme.maxWidth, ctx.y);
        ctx.y += 16;
        break;
      case "schema":
        renderSchemaBlock(ctx, block, schemaAsset);
        break;
      default:
        break;
    }
  }

  return ctx.y;
}

export function buildMarkdownPdfTheme(
  doc: jsPDF,
  falcMode: boolean,
  margin = 48,
): MarkdownPdfTheme {
  const pageWidth = doc.internal.pageSize.getWidth();
  return {
    falcMode,
    margin,
    maxWidth: pageWidth - margin * 2,
    bodySize: falcMode ? 16 : 14,
    bodyLineHeight: falcMode ? 28 : 22,
    paragraphGap: falcMode ? 16 : 12,
    listIndent: falcMode ? 22 : 18,
    headingSizes: falcMode
      ? { 1: 22, 2: 20, 3: 18, 4: 16, 5: 15, 6: 14 }
      : { 1: 20, 2: 18, 3: 16, 4: 15, 5: 14, 6: 13 },
    headingGap: falcMode
      ? {
          1: { before: 8, after: 12 },
          2: { before: 14, after: 10 },
          3: { before: 12, after: 8 },
          4: { before: 10, after: 6 },
          5: { before: 8, after: 4 },
          6: { before: 6, after: 4 },
        }
      : {
          1: { before: 6, after: 10 },
          2: { before: 12, after: 8 },
          3: { before: 10, after: 6 },
          4: { before: 8, after: 4 },
          5: { before: 6, after: 4 },
          6: { before: 4, after: 4 },
        },
  };
}
