export type AdaptationLevel = "standard" | "simplified" | "falc";

export const ADAPTATION_LEVELS: {
  value: AdaptationLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "standard",
    label: "Standard",
    description: "Adaptation légère",
  },
  {
    value: "simplified",
    label: "Simplifié",
    description: "Adaptation pédagogique renforcée",
  },
  {
    value: "falc",
    label: "FALC",
    description: "Facile à Lire et à Comprendre",
  },
];

export function isAdaptationLevel(value: string): value is AdaptationLevel {
  return value === "standard" || value === "simplified" || value === "falc";
}
