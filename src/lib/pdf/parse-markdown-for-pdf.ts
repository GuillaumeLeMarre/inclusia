import { cleanAdaptationContent } from "@/lib/adaptations/clean-adaptation-content";

export interface InlineSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; spans: InlineSpan[] }
  | { type: "paragraph"; spans: InlineSpan[] }
  | { type: "ul"; items: InlineSpan[][] }
  | { type: "ol"; items: InlineSpan[][] }
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

function parseListItem(line: string, ordered: boolean): InlineSpan[] | null {
  const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/;
  const match = line.match(pattern);
  if (!match) return null;
  return parseInlineMarkdown(match[1]!);
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

    const ulItem = parseListItem(trimmed, false);
    if (ulItem) {
      const items: InlineSpan[][] = [ulItem];
      i += 1;
      while (i < lines.length) {
        const next = parseListItem(lines[i]!.trim(), false);
        if (!next) break;
        items.push(next);
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const olItem = parseListItem(trimmed, true);
    if (olItem) {
      const items: InlineSpan[][] = [olItem];
      i += 1;
      while (i < lines.length) {
        const next = parseListItem(lines[i]!.trim(), true);
        if (!next) break;
        items.push(next);
        i += 1;
      }
      blocks.push({ type: "ol", items });
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
        || parseListItem(next, false)
        || parseListItem(next, true)
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
