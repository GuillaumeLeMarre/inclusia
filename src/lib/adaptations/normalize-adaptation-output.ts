import type { AdaptationOutput } from "@/services/adaptation/demo-adaptation.service";

const TEXT_FIELDS = [
  "adapted_content",
  "summary",
  "memory_sheet",
  "adapted_instructions",
  "audio_script",
] as const;

/** Convertit une valeur IA en texte : les listes deviennent des puces Markdown. */
function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item).trim())
      .filter(Boolean)
      .map((line) => (/^[-*]\s/.test(line) ? line : `- ${line}`))
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => toText(item).trim())
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
}

/**
 * Le modèle ne respecte pas toujours le schéma JSON demandé
 * (ex. `memory_sheet` renvoyé en tableau). Normalise les champs texte et listes.
 */
export function normalizeAdaptationOutput(raw: unknown): AdaptationOutput {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const output = { ...data } as Record<string, unknown>;

  for (const field of TEXT_FIELDS) {
    output[field] = toText(data[field]);
  }

  const questions = data.simplified_questions;
  output.simplified_questions = Array.isArray(questions)
    ? questions.map((q) => toText(q)).filter(Boolean)
    : toText(questions).split("\n").map((q) => q.replace(/^[-*]\s/, "").trim()).filter(Boolean);

  if (!Array.isArray(data.keywords)) output.keywords = [];

  return output as unknown as AdaptationOutput;
}
