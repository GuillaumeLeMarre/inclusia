/** Nettoie le contenu IA avant rendu Markdown (sans supprimer la syntaxe utile). */
export function cleanAdaptationContent(raw: string): string {
  let text = raw.trim();
  if (!text) return "";

  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:markdown|md)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
  }

  text = text.replace(/\r\n/g, "\n");
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
