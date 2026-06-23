export const MINDMAP_ROOT_LABEL_MAX_LENGTH = 18;

function abbreviateWord(word: string, maxLength: number): string {
  if (word.length <= maxLength) return word;
  return `${word.slice(0, Math.max(3, maxLength - 1))}.`;
}

/** Raccourcit un titre pour le nœud central d'une mindmap (FALC : libellés courts). */
export function abbreviateMindmapRootLabel(
  title: string,
  maxLength = MINDMAP_ROOT_LABEL_MAX_LENGTH,
): string {
  const cleaned = title.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Idée";
  if (cleaned.length <= maxLength) return cleaned;

  const words = cleaned.split(" ").filter(Boolean);

  if (words.length >= 2) {
    for (let perWord = 7; perWord >= 3; perWord -= 1) {
      const attempt = words
        .map((word, index) => {
          const isLast = index === words.length - 1;
          const limit = isLast ? Math.min(perWord + 2, 10) : perWord;
          return abbreviateWord(word, limit);
        })
        .join(" ");
      if (attempt.length <= maxLength) return attempt;
    }

    const spacedInitials = words.map((word) => `${word[0]?.toUpperCase() ?? ""}.`).join(" ");
    if (spacedInitials.length <= maxLength) return spacedInitials;

    const compactInitials = `${words.map((word) => word[0]?.toUpperCase() ?? "").join(".")}.`;
    if (compactInitials.length <= maxLength) return compactInitials;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}
