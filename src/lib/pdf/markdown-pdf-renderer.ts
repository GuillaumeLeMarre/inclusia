import type { jsPDF } from "jspdf";
import type { InlineSpan, MarkdownBlock, OrderedListItem } from "@/lib/pdf/parse-markdown-for-pdf";
import type { SchemaPdfAsset } from "@/lib/pdf/schema-pdf-image";
import {
  ensureSchemaSectionFitsOnPage,
  estimateSchemaBlockHeight,
} from "@/lib/pdf/schema-section-pdf-layout";
import {
  countLinesForPageChunk,
  shouldStartBlockOnFreshPage,
} from "@/lib/pdf/paragraph-pdf-layout";

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

function usablePageHeight(ctx: RenderContext): number {
  return pageHeight(ctx.doc) - ctx.theme.margin * 2;
}

function remainingHeight(ctx: RenderContext): number {
  return pageHeight(ctx.doc) - ctx.theme.margin - ctx.y;
}

function startFreshPage(ctx: RenderContext): void {
  ctx.doc.addPage();
  ctx.y = ctx.theme.margin;
}

function ensureSpace(ctx: RenderContext, needed: number): void {
  if (ctx.y + needed <= pageHeight(ctx.doc) - ctx.theme.margin) return;
  startFreshPage(ctx);
}

function ensureBlockFits(ctx: RenderContext, neededHeight: number): void {
  if (neededHeight <= remainingHeight(ctx)) return;
  startFreshPage(ctx);
}

function ensureParagraphBlockFits(
  ctx: RenderContext,
  blockHeight: number,
): void {
  if (shouldStartBlockOnFreshPage(blockHeight, remainingHeight(ctx), usablePageHeight(ctx))) {
    startFreshPage(ctx);
  }
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

function breakSpansIntoLines(
  ctx: RenderContext,
  spans: InlineSpan[],
  options: {
    fontSize: number;
    indent?: number;
    maxWidth?: number;
  },
): InlineSpan[][] {
  const indent = options.indent ?? 0;
  const maxWidth = options.maxWidth ?? ctx.theme.maxWidth - indent;
  const startX = ctx.x + indent;
  let x = startX;
  let currentLine: InlineSpan[] = [];
  const lines: InlineSpan[][] = [];

  const pushWord = (span: InlineSpan, word: string) => {
    const last = currentLine[currentLine.length - 1];
    if (
      last
      && last.bold === span.bold
      && last.italic === span.italic
      && last.code === span.code
    ) {
      last.text += word;
      return;
    }
    currentLine.push({ ...span, text: word });
  };

  for (const span of spans) {
    const words = span.text.split(/(\s+)/).filter((part) => part.length > 0);
    for (const word of words) {
      setSpanFont(ctx.doc, span, options.fontSize);
      const width = ctx.doc.getTextWidth(word);

      if (x + width > startX + maxWidth && x > startX) {
        lines.push(currentLine);
        currentLine = [];
        x = startX;
      }

      pushWord(span, word);
      x += width;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

function estimateSpanBlockHeight(
  ctx: RenderContext,
  spans: InlineSpan[],
  options: {
    fontSize: number;
    lineHeight: number;
    indent?: number;
    maxWidth?: number;
    trailingGap?: number;
  },
): number {
  const lines = breakSpansIntoLines(ctx, spans, options);
  const trailingGap = options.trailingGap ?? 0;
  return Math.max(lines.length, 1) * options.lineHeight + trailingGap;
}

function drawSpanLine(
  ctx: RenderContext,
  spans: InlineSpan[],
  options: {
    fontSize: number;
    indent?: number;
  },
): void {
  const indent = options.indent ?? 0;
  let x = ctx.x + indent;

  for (const span of spans) {
    setSpanFont(ctx.doc, span, options.fontSize);
    ctx.doc.text(span.text, x, ctx.y);
    x += ctx.doc.getTextWidth(span.text);
  }
}

function renderSpanLinesWithoutOrphans(
  ctx: RenderContext,
  lines: InlineSpan[][],
  options: {
    fontSize: number;
    lineHeight: number;
    indent?: number;
    maxWidth?: number;
  },
): void {
  if (lines.length === 0) {
    ctx.y += options.lineHeight;
    return;
  }

  let index = 0;
  while (index < lines.length) {
    let linesThatFit = Math.floor(remainingHeight(ctx) / options.lineHeight);
    if (linesThatFit < 1) {
      startFreshPage(ctx);
      linesThatFit = Math.floor(remainingHeight(ctx) / options.lineHeight);
    }

    const linesLeft = lines.length - index;
    const chunkSize = countLinesForPageChunk(linesLeft, linesThatFit);
    if (chunkSize === 0) {
      startFreshPage(ctx);
      continue;
    }

    for (let offset = 0; offset < chunkSize; offset += 1) {
      drawSpanLine(ctx, lines[index + offset]!, options);
      ctx.y += options.lineHeight;
    }

    index += chunkSize;
    if (index < lines.length) {
      startFreshPage(ctx);
    }
  }
}

function renderSpans(
  ctx: RenderContext,
  spans: InlineSpan[],
  options: {
    fontSize: number;
    lineHeight: number;
    indent?: number;
    maxWidth?: number;
    preventOrphans?: boolean;
    trailingGap?: number;
  },
): void {
  if (options.preventOrphans ?? false) {
    const blockHeight = estimateSpanBlockHeight(ctx, spans, options);
    ensureParagraphBlockFits(ctx, blockHeight);
    const lines = breakSpansIntoLines(ctx, spans, options);
    renderSpanLinesWithoutOrphans(ctx, lines, options);
    if (options.trailingGap) {
      ctx.y += options.trailingGap;
    }
    return;
  }

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

function spansToPlainText(spans: InlineSpan[]): string {
  return spans.map((span) => span.text).join("");
}

function getCourseTitleSize(theme: MarkdownPdfTheme): number {
  return theme.falcMode ? 22 : 20;
}

function renderCourseTitleBlock(ctx: RenderContext, spans: InlineSpan[]): void {
  const fontSize = getCourseTitleSize(ctx.theme);
  const lineHeight = fontSize * 1.3;
  const centerX = ctx.doc.internal.pageSize.getWidth() / 2;
  const text = spansToPlainText(spans);
  const plainLines = ctx.doc.splitTextToSize(text, ctx.theme.maxWidth) as string[];
  const lines = plainLines.map((line) => [{ text: line, bold: true } satisfies InlineSpan]);

  ctx.y += ctx.theme.falcMode ? 4 : 0;

  const blockHeight = lines.length * lineHeight + ctx.theme.paragraphGap * 0.75;
  ensureParagraphBlockFits(ctx, blockHeight);

  let index = 0;
  while (index < lines.length) {
    let linesThatFit = Math.floor(remainingHeight(ctx) / lineHeight);
    if (linesThatFit < 1) {
      startFreshPage(ctx);
      linesThatFit = Math.floor(remainingHeight(ctx) / lineHeight);
    }

    const linesLeft = lines.length - index;
    const chunkSize = countLinesForPageChunk(linesLeft, linesThatFit);
    if (chunkSize === 0) {
      startFreshPage(ctx);
      continue;
    }

    for (let offset = 0; offset < chunkSize; offset += 1) {
      const line = spansToPlainText(lines[index + offset]!);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(fontSize);
      ctx.doc.text(line, centerX, ctx.y, { align: "center" });
      ctx.y += lineHeight;
    }

    index += chunkSize;
    if (index < lines.length) {
      startFreshPage(ctx);
    }
  }

  ctx.y += ctx.theme.paragraphGap * 0.75;
}

function renderHeading(ctx: RenderContext, block: Extract<MarkdownBlock, { type: "heading" }>): void {
  if (block.isCourseTitle) {
    renderCourseTitleBlock(ctx, block.spans);
    return;
  }

  const size = ctx.theme.headingSizes[block.level];
  const gap = ctx.theme.headingGap[block.level];
  ctx.y += gap.before;
  renderSpans(ctx, block.spans, {
    fontSize: size,
    lineHeight: size * 1.25,
    preventOrphans: true,
  });
  ctx.y += gap.after - size * 0.25;
}

function orderedListMarkerNumber(
  item: OrderedListItem,
  index: number,
  items: OrderedListItem[],
): number {
  if (items.every((entry) => entry.number === 1)) return index + 1;

  const sequentialFromOne = items.every((entry, idx) => entry.number === idx + 1);
  if (items[0]?.number === 1 && sequentialFromOne) return index + 1;

  return item.number;
}

function renderUnorderedList(ctx: RenderContext, items: InlineSpan[][]): void {
  const bulletWidth = ctx.theme.listIndent;
  items.forEach((item) => {
    const blockHeight = estimateSpanBlockHeight(ctx, item, {
      fontSize: ctx.theme.bodySize,
      lineHeight: ctx.theme.bodyLineHeight,
      indent: bulletWidth,
      maxWidth: ctx.theme.maxWidth - bulletWidth,
      trailingGap: ctx.theme.paragraphGap * 0.35,
    });
    ensureParagraphBlockFits(ctx, blockHeight);

    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(ctx.theme.bodySize);
    ctx.doc.text("•", ctx.x, ctx.y);
    renderSpans(ctx, item, {
      fontSize: ctx.theme.bodySize,
      lineHeight: ctx.theme.bodyLineHeight,
      indent: bulletWidth,
      maxWidth: ctx.theme.maxWidth - bulletWidth,
      preventOrphans: true,
      trailingGap: ctx.theme.paragraphGap * 0.35,
    });
  });
}

function renderOrderedList(ctx: RenderContext, items: OrderedListItem[]): void {
  const bulletWidth = ctx.theme.listIndent;
  items.forEach((item, index) => {
    const blockHeight = estimateSpanBlockHeight(ctx, item.spans, {
      fontSize: ctx.theme.bodySize,
      lineHeight: ctx.theme.bodyLineHeight,
      indent: bulletWidth,
      maxWidth: ctx.theme.maxWidth - bulletWidth,
      trailingGap: ctx.theme.paragraphGap * 0.35,
    });
    ensureParagraphBlockFits(ctx, blockHeight);

    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(ctx.theme.bodySize);
    const marker = `${orderedListMarkerNumber(item, index, items)}.`;
    ctx.doc.text(marker, ctx.x, ctx.y);
    renderSpans(ctx, item.spans, {
      fontSize: ctx.theme.bodySize,
      lineHeight: ctx.theme.bodyLineHeight,
      indent: bulletWidth,
      maxWidth: ctx.theme.maxWidth - bulletWidth,
      preventOrphans: true,
      trailingGap: ctx.theme.paragraphGap * 0.35,
    });
  });
}

function renderSchemaBlock(
  ctx: RenderContext,
  block: Extract<MarkdownBlock, { type: "schema" }>,
  schemaAsset: SchemaPdfAsset | null,
): void {
  const blockHeight = estimateSchemaBlockHeight(ctx, block, schemaAsset);
  ensureBlockFits(ctx, blockHeight);

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

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;
    ctx.y = ensureSchemaSectionFitsOnPage(
      doc,
      theme,
      ctx.y,
      pageHeight(doc),
      blocks,
      i,
      schemaAsset,
    );

    switch (block.type) {
      case "heading":
        renderHeading(ctx, block);
        break;
      case "paragraph":
        if (block.isCourseTitle) {
          renderCourseTitleBlock(ctx, block.spans);
          break;
        }
        renderSpans(ctx, block.spans, {
          fontSize: ctx.theme.bodySize,
          lineHeight: ctx.theme.bodyLineHeight,
          preventOrphans: true,
          trailingGap: ctx.theme.paragraphGap * 0.5,
        });
        break;
      case "ul":
        renderUnorderedList(ctx, block.items);
        ctx.y += ctx.theme.paragraphGap * 0.35;
        break;
      case "ol":
        renderOrderedList(ctx, block.items);
        ctx.y += ctx.theme.paragraphGap * 0.35;
        break;
      case "blockquote":
        ctx.doc.setDrawColor(180, 180, 180);
        ctx.doc.setLineWidth(2);
        ctx.doc.line(ctx.x + 4, ctx.y - ctx.theme.bodySize * 0.75, ctx.x + 4, ctx.y + ctx.theme.bodyLineHeight);
        renderSpans(ctx, block.spans, {
          fontSize: ctx.theme.bodySize,
          lineHeight: ctx.theme.bodyLineHeight,
          indent: 16,
          maxWidth: ctx.theme.maxWidth - 16,
          preventOrphans: true,
          trailingGap: ctx.theme.paragraphGap * 0.5,
        });
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
