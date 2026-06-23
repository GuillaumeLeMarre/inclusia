import { isValidElement, type ReactNode } from "react";
import type { FalcPictogramItem } from "@/types/falc";
import { pictogramKeywordsEquivalent } from "@/lib/pictograms/keyword-match";

const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux", "et", "ou", "en", "à",
  "pour", "par", "sur", "dans", "avec", "sans", "est", "sont", "être", "avoir", "ce",
  "cette", "ces", "qui", "que", "quoi", "comment", "pourquoi", "quand", "où", "il", "elle",
  "nous", "vous", "ils", "elles",
]);

export function normalizePictogramKeyword(raw: string): string | null {
  const cleaned = raw
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (cleaned.length < 2) return null;

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 1 && STOP_WORDS.has(words[0]!)) return null;

  return cleaned;
}

export function buildPictogramLookup(items: FalcPictogramItem[]): Map<string, FalcPictogramItem> {
  const lookup = new Map<string, FalcPictogramItem>();

  for (const item of items) {
    for (const candidate of [item.keyword, item.label]) {
      const key = normalizePictogramKeyword(candidate);
      if (key && !lookup.has(key)) lookup.set(key, item);
    }
  }

  return lookup;
}

export function findPictogramForText(
  text: string,
  lookup: Map<string, FalcPictogramItem>,
): FalcPictogramItem | null {
  const normalized = normalizePictogramKeyword(text);
  if (!normalized) return null;

  const direct = lookup.get(normalized);
  if (direct) return direct;

  for (const [key, item] of lookup) {
    if (pictogramKeywordsEquivalent(key, normalized)) return item;
  }

  return null;
}

export function extractMarkdownChildrenText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    return children.map(extractMarkdownChildrenText).join("");
  }
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    if (props.children != null) return extractMarkdownChildrenText(props.children);
  }
  return "";
}
