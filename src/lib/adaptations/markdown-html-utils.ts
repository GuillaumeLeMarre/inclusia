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
