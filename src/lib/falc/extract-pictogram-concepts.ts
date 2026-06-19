import type { KeywordItem } from "@/types";

const STOP_WORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux", "et", "ou", "en", "à",
  "pour", "par", "sur", "dans", "avec", "sans", "est", "sont", "être", "avoir", "ce",
  "cette", "ces", "qui", "que", "quoi", "comment", "pourquoi", "quand", "où", "il", "elle",
  "nous", "vous", "ils", "elles", "the", "a", "an", "and", "or", "is", "are", "to", "of",
]);

const MAX_CONCEPTS = 12;
const MIN_WORD_LENGTH = 3;

function normalizeConcept(raw: string): string | null {
  const cleaned = raw
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (cleaned.length < MIN_WORD_LENGTH) return null;

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length === 1 && STOP_WORDS.has(words[0]!)) return null;
  if (words.length > 4) return words.slice(0, 3).join(" ");

  return cleaned;
}

function addConcept(set: Set<string>, raw: string) {
  const concept = normalizeConcept(raw);
  if (concept) set.add(concept);
}

export function extractPictogramConcepts(
  content: string,
  keywords?: KeywordItem[] | null,
): string[] {
  const concepts = new Set<string>();

  keywords?.forEach((item) => addConcept(concepts, item.term));

  for (const match of content.matchAll(/^#{1,3}\s+(.+)$/gm)) {
    addConcept(concepts, match[1] ?? "");
  }

  for (const match of content.matchAll(/\*\*([^*]+)\*\*/g)) {
    addConcept(concepts, match[1] ?? "");
  }

  for (const match of content.matchAll(/^[-*+]\s+(.+)$/gm)) {
    const line = match[1] ?? "";
    const beforeColon = line.split(":")[0] ?? line;
    const firstWords = beforeColon.split(/\s+/).slice(0, 3).join(" ");
    addConcept(concepts, firstWords);
  }

  if (concepts.size < 4) {
    const words = content
      .replace(/[#*_`[\]()]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w.toLowerCase()));

    for (const word of words) {
      addConcept(concepts, word);
      if (concepts.size >= MAX_CONCEPTS) break;
    }
  }

  return Array.from(concepts).slice(0, MAX_CONCEPTS);
}
