export const PEDAGOGICAL_PROFILE_CATEGORIES = [
  { value: "learning", label: "Apprentissage" },
  { value: "motor", label: "Moteur" },
  { value: "language", label: "Langage" },
  { value: "attention", label: "Attention" },
  { value: "social", label: "Social" },
  { value: "sensory", label: "Sensoriel" },
  { value: "accessibility", label: "Accessibilité" },
] as const;

export type PedagogicalProfileCategory =
  (typeof PEDAGOGICAL_PROFILE_CATEGORIES)[number]["value"];

export const PROFILE_CATEGORY_FILTER_OPTIONS = [
  { value: "", label: "Toutes les catégories" },
  ...PEDAGOGICAL_PROFILE_CATEGORIES,
];

export function getProfileCategoryLabel(value: string): string {
  return PEDAGOGICAL_PROFILE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function isKnownProfileCategory(value: string): value is PedagogicalProfileCategory {
  return PEDAGOGICAL_PROFILE_CATEGORIES.some((c) => c.value === value);
}
