import type { Element, ElementContent, RootContent } from "hast";

const BLOCK_TAGS = new Set([
  "img",
  "figure",
  "div",
  "table",
  "ul",
  "ol",
  "blockquote",
  "pre",
  "hr",
]);

/** Détecte si un paragraphe Markdown contient un élément bloc (ex. image). */
export function markdownNodeHasBlockChild(node: unknown): boolean {
  if (!node || typeof node !== "object" || !("children" in node)) return false;
  const children = (node as { children?: ElementContent[] }).children ?? [];

  return children.some((child) => {
    if (child.type !== "element") return false;
    return BLOCK_TAGS.has((child as Element).tagName);
  });
}

/** Détecte si le contenu contient une image Markdown. */
export function contentHasMarkdownImage(text: string): boolean {
  return /!\[[^\]]*\]\([^)]+\)/.test(text);
}

export function isBoldOnlyParagraph(node: unknown): boolean {
  if (!node || typeof node !== "object" || !("children" in node)) return false;
  const children = ((node as { children?: RootContent[] }).children ?? []).filter(
    (child) => child.type !== "text" || !/^\s*$/.test(String(child.value)),
  );

  return (
    children.length === 1
    && children[0].type === "element"
    && (children[0] as Element).tagName === "strong"
  );
}

export function isImageOnlyParagraph(node: unknown): boolean {
  if (!node || typeof node !== "object" || !("children" in node)) return false;
  const children = ((node as { children?: RootContent[] }).children ?? []).filter(
    (child) => child.type !== "text" || !/^\s*$/.test(String(child.value)),
  );

  return (
    children.length === 1
    && children[0].type === "element"
    && (children[0] as Element).tagName === "img"
  );
}

export type FirstCourseTitleKind = "heading" | "bold-paragraph";

export interface FirstCourseTitleLocation {
  kind: FirstCourseTitleKind;
  /** Numéro de ligne 1-based dans le markdown passé à ReactMarkdown */
  line: number;
}

export function findFirstCourseTitleLocation(content: string): FirstCourseTitleLocation | null {
  const lines = content.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index]!.trim();
    if (!trimmed || /^-{3,}$/.test(trimmed)) continue;

    if (/^#{1,6}\s+/.test(trimmed)) {
      return { kind: "heading", line: index + 1 };
    }

    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      return { kind: "bold-paragraph", line: index + 1 };
    }

    return null;
  }

  return null;
}

export function getMarkdownNodeStartLine(node: unknown): number | null {
  if (!node || typeof node !== "object" || !("position" in node)) return null;
  const position = (node as { position?: { start?: { line?: number } } }).position;
  return position?.start?.line ?? null;
}

export function isFirstCourseTitleNode(
  node: unknown,
  location: FirstCourseTitleLocation | null,
  kind: FirstCourseTitleKind,
): boolean {
  if (!location || location.kind !== kind) return false;
  return getMarkdownNodeStartLine(node) === location.line;
}
