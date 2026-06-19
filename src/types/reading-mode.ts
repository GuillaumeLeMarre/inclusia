export type ReadingMode = "standard" | "dyslexia" | "tdah" | "high-contrast" | "falc";

export const READING_MODE_STORAGE_KEY = "inclusia-reading-mode";

export const READING_MODE_OPTIONS: { value: ReadingMode; label: string; description: string }[] = [
  {
    value: "standard",
    label: "Standard",
    description: "Lecture confortable pour un usage quotidien.",
  },
  {
    value: "dyslexia",
    label: "Dyslexie",
    description: "Police OpenDyslexic, texte large et interligne augmenté.",
  },
  {
    value: "tdah",
    label: "TDAH",
    description: "Paragraphes aérés et blocs courts pour maintenir l'attention.",
  },
  {
    value: "high-contrast",
    label: "Contraste élevé",
    description: "Contraste renforcé pour une meilleure lisibilité.",
  },
  {
    value: "falc",
    label: "FALC",
    description: "Facile à Lire et à Comprendre — texte large, espacement renforcé.",
  },
];

export function isReadingMode(value: string): value is ReadingMode {
  return ["standard", "dyslexia", "tdah", "high-contrast", "falc"].includes(value);
}
