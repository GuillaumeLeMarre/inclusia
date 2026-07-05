import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { EMPTY_PEDAGOGICAL_DIMENSIONS } from "@/types/pedagogical-dimensions";
import { systemDimensionsFromProfile } from "@/lib/profiles/dimension-form-helpers";

export type AdminProfileTab =
  | "general"
  | "objectives"
  | "language"
  | "layout"
  | "structure"
  | "visual"
  | "audio"
  | "exercises"
  | "evaluation"
  | "history";

export const ADMIN_PROFILE_TABS: { id: AdminProfileTab; label: string }[] = [
  { id: "general", label: "Général" },
  { id: "objectives", label: "Objectifs" },
  { id: "language", label: "Langage" },
  { id: "layout", label: "Mise en page" },
  { id: "structure", label: "Structuration" },
  { id: "visual", label: "Visuel" },
  { id: "audio", label: "Audio" },
  { id: "exercises", label: "Exercices" },
  { id: "evaluation", label: "Évaluation" },
  { id: "history", label: "Historique" },
];

export interface AdminProfileFormState {
  slug: string;
  name: string;
  category: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  change_note: string;
  pedagogical_objectives: string[];
  linguistic_rules: string[];
  layout_rules: string[];
  structuring_rules: string[];
  visual_aids: string[];
  audio_aids: string[];
  exercise_adaptations: string[];
  evaluation_rules: string[];
}

export function buildAdminProfileFormState(initial?: PedagogicalProfile): AdminProfileFormState {
  const dimensions = initial
    ? systemDimensionsFromProfile(initial)
    : { ...EMPTY_PEDAGOGICAL_DIMENSIONS };

  return {
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    category: initial?.category ?? "learning",
    description: initial?.description ?? "",
    is_active: initial?.is_active ?? true,
    sort_order: initial?.sort_order ?? 0,
    change_note: "",
    ...dimensions,
  };
}

export function dimensionColumnForTab(tab: AdminProfileTab): keyof AdminProfileFormState | null {
  const map: Partial<Record<AdminProfileTab, keyof AdminProfileFormState>> = {
    objectives: "pedagogical_objectives",
    language: "linguistic_rules",
    layout: "layout_rules",
    structure: "structuring_rules",
    visual: "visual_aids",
    audio: "audio_aids",
    exercises: "exercise_adaptations",
    evaluation: "evaluation_rules",
  };
  return map[tab] ?? null;
}
