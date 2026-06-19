import { contentHasMarkdownImage } from "@/lib/adaptations/markdown-html-utils";

const FALC_SCHEMA_HEADING = "## Schéma";
const FALC_SCHEMA_INTRO = "Ce schéma t'aide à comprendre le cours.";

/** Insère une section schéma dans le contenu FALC si absente. */
export function injectFalcSchemaSection(content: string, schemaTitle: string): string {
  const trimmed = content.trim();
  if (!trimmed) return trimmed;
  if (contentHasMarkdownImage(trimmed)) return trimmed;
  if (trimmed.includes(FALC_SCHEMA_HEADING) || trimmed.includes("## Partie schéma")) return trimmed;

  const title = schemaTitle.trim() || "Schéma du cours";
  return `${trimmed}\n\n${FALC_SCHEMA_HEADING}\n\n${FALC_SCHEMA_INTRO}\n\n![${title}](schema)\n`;
}
