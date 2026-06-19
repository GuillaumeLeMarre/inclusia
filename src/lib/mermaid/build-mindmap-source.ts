import type { Adaptation } from "@/types";

const MAX_SOURCE_CHARS = 2400;

/** Extrait un texte court et pertinent pour la génération de schéma (moins de tokens = plus rapide). */
export function buildMindmapSourceText(adaptation: Adaptation): string {
  const summary = adaptation.summary?.trim() ?? "";
  const memorySheet = adaptation.memory_sheet?.trim() ?? "";
  const adapted =
    adaptation.adaptation_level === "falc" && adaptation.falc_content?.trim()
      ? adaptation.falc_content.trim()
      : (adaptation.adapted_content?.trim() ?? "");

  const parts: string[] = [];
  if (summary) parts.push(summary);
  if (memorySheet) parts.push(memorySheet);

  const base = parts.join("\n\n");
  if (base.length >= 800) {
    return base.slice(0, MAX_SOURCE_CHARS);
  }

  if (adapted) {
    const remaining = MAX_SOURCE_CHARS - base.length - 2;
    parts.push(adapted.slice(0, Math.max(remaining, 600)));
  }

  return parts.join("\n\n").slice(0, MAX_SOURCE_CHARS).trim();
}
