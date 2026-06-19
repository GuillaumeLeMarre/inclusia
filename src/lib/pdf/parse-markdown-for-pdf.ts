import { cleanAdaptationContent } from "@/lib/adaptations/clean-adaptation-content";

export interface InlineSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

export interface OrderedListItem {
  number: number;
  spans: InlineSpan[];
}

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; spans: InlineSpan[] }
  | { type: "paragraph"; spans: InlineSpan[] }
  | { type: "ul"; items: InlineSpan[][] }
  | { type: "ol"; items: OrderedListItem[] }
  | { type: "blockquote"; spans: InlineSpan[] }
  | { type: "hr" }
  | { type: "schema"; label: string };

export function parseInlineMarkdown(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const bold = remaining.match(/^\*\*([^*]+)\*\*/);
    if (bold) {
      spans.push({ text: bold[1]!, bold: true });
      remaining = remaining.slice(bold[0].length);
      continue;
    }

    const italic = remaining.match(/^\*([^*]+)\*/);
    if (italic) {
      spans.push({ text: italic[1]!, italic: true });
      remaining = remaining.slice(italic[0].length);
      continue;
    }

    const code = remaining.match(/^`([^`]+)`/);
    if (code) {
      spans.push({ text: code[1]!, code: true });
      remaining = remaining.slice(code[0].length);
      continue;
    }

    const next = remaining.search(/\*\*|\*|`|!\[/);
    if (next === -1) {
      spans.push({ text: remaining });
      break;
    }

    if (next > 0) {
      spans.push({ text: remaining.slice(0, next) });
      remaining = remaining.slice(next);
      continue;
    }

    if (remaining.startsWith("![")) {
      const image = remaining.match(/^!\[([^\]]*)\]\([^)]+\)/);
      if (image) {
        spans.push({ text: `[Schéma : ${image[1] || "diagramme"}]`, italic: true });
        remaining = remaining.slice(image[0].length);
        continue;
      }
    }

    spans.push({ text: remaining[0]! });
    remaining = remaining.slice(1);
  }

  return spans.filter((span) => span.text.length > 0);
}

function isHr(line: string): boolean {
  return /^(\*{3,}|-{3,}|_{3,})$/.test(line.trim());
}

function parseUnorderedListItem(line: string): InlineSpan[] | null {
  const match = line.match(/^[-*+]\s+(.+)$/);
  if (!match) return null;
  return parseInlineMarkdown(match[1]!);
}

function parseOrderedListItem(line: string): OrderedListItem | null {
  const match = line.match(/^(\d+)[.)]\s+(.+)$/);
  if (!match) return null;
  return {
    number: Number.parseInt(match[1]!, 10),
    spans: parseInlineMarkdown(match[2]!),
  };
}

function collectOrderedListItems(lines: string[], startIndex: number): {
  items: OrderedListItem[];
  nextIndex: number;
} {
  const items: OrderedListItem[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) {
      let j = i + 1;
      while (j < lines.length && !lines[j]!.trim()) j += 1;
      if (j < lines.length && parseOrderedListItem(lines[j]!.trim())) {
        i = j;
        continue;
      }
      break;
    }

    const item = parseOrderedListItem(trimmed);
    if (!item) break;
    items.push(item);
    i += 1;
  }

  return { items, nextIndex: i };
}

function collectUnorderedListItems(lines: string[], startIndex: number): {
  items: InlineSpan[][];
  nextIndex: number;
} {
  const items: InlineSpan[][] = [];
  let i = startIndex;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (!trimmed) {
      let j = i + 1;
      while (j < lines.length && !lines[j]!.trim()) j += 1;
      if (j < lines.length && parseUnorderedListItem(lines[j]!.trim())) {
        i = j;
        continue;
      }
      break;
    }

    const item = parseUnorderedListItem(trimmed);
    if (!item) break;
    items.push(item);
    i += 1;
  }

  return { items, nextIndex: i };
}

export function parseMarkdownBlocks(raw: string): MarkdownBlock[] {
  const text = cleanAdaptationContent(raw);
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (isHr(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1]!.length as 1 | 2 | 3 | 4 | 5 | 6,
        spans: parseInlineMarkdown(heading[2]!),
      });
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith(">")) {
        quoteLines.push(lines[i]!.trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({
        type: "blockquote",
        spans: parseInlineMarkdown(quoteLines.join(" ")),
      });
      continue;
    }

    const ulItem = parseUnorderedListItem(trimmed);
    if (ulItem) {
      const collected = collectUnorderedListItems(lines, i);
      blocks.push({ type: "ul", items: collected.items });
      i = collected.nextIndex;
      continue;
    }

    const olItem = parseOrderedListItem(trimmed);
    if (olItem) {
      const collected = collectOrderedListItems(lines, i);
      blocks.push({ type: "ol", items: collected.items });
      i = collected.nextIndex;
      continue;
    }

    const imageOnly = trimmed.match(/^!\[([^\]]*)\]\([^)]+\)$/);
    if (imageOnly) {
      blocks.push({ type: "schema", label: imageOnly[1] || "Schéma du cours" });
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const next = lines[i]!.trim();
      if (
        !next
        || isHr(next)
        || /^(#{1,6})\s/.test(next)
        || next.startsWith(">")
        || parseUnorderedListItem(next)
        || parseOrderedListItem(next)
        || /^!\[/.test(next)
      ) {
        break;
      }
      paragraphLines.push(next);
      i += 1;
    }

    blocks.push({
      type: "paragraph",
      spans: parseInlineMarkdown(paragraphLines.join(" ")),
    });
  }

  return blocks;
}
