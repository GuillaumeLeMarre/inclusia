/** Clés internes de stratégie (merge / prompt). */
export type StrategyDimensionKey =
  | "objectives"
  | "linguistic_rules"
  | "layout_rules"
  | "structure_rules"
  | "visual_aids"
  | "audio_aids"
  | "exercise_adaptations"
  | "evaluation_rules";

/** Colonnes DB profils système. */
export type SystemDimensionColumn =
  | "pedagogical_objectives"
  | "linguistic_rules"
  | "layout_rules"
  | "structuring_rules"
  | "visual_aids"
  | "audio_aids"
  | "exercise_adaptations"
  | "evaluation_rules";

/** Colonnes DB profils enseignants. */
export type TeacherDimensionColumn =
  | "custom_pedagogical_objectives"
  | "custom_linguistic_rules"
  | "custom_layout_rules"
  | "custom_structuring_rules"
  | "custom_visual_aids"
  | "custom_audio_aids"
  | "custom_exercise_adaptations"
  | "custom_evaluation_rules";

export interface PedagogicalDimensions {
  pedagogical_objectives: string[];
  linguistic_rules: string[];
  layout_rules: string[];
  structuring_rules: string[];
  visual_aids: string[];
  audio_aids: string[];
  exercise_adaptations: string[];
  evaluation_rules: string[];
}

export interface TeacherCustomDimensions {
  custom_pedagogical_objectives: string[];
  custom_linguistic_rules: string[];
  custom_layout_rules: string[];
  custom_structuring_rules: string[];
  custom_visual_aids: string[];
  custom_audio_aids: string[];
  custom_exercise_adaptations: string[];
  custom_evaluation_rules: string[];
}

export const EMPTY_PEDAGOGICAL_DIMENSIONS: PedagogicalDimensions = {
  pedagogical_objectives: [],
  linguistic_rules: [],
  layout_rules: [],
  structuring_rules: [],
  visual_aids: [],
  audio_aids: [],
  exercise_adaptations: [],
  evaluation_rules: [],
};

export const EMPTY_TEACHER_DIMENSIONS: TeacherCustomDimensions = {
  custom_pedagogical_objectives: [],
  custom_linguistic_rules: [],
  custom_layout_rules: [],
  custom_structuring_rules: [],
  custom_visual_aids: [],
  custom_audio_aids: [],
  custom_exercise_adaptations: [],
  custom_evaluation_rules: [],
};

export const SYSTEM_COLUMN_TO_STRATEGY_KEY: Record<SystemDimensionColumn, StrategyDimensionKey> = {
  pedagogical_objectives: "objectives",
  linguistic_rules: "linguistic_rules",
  layout_rules: "layout_rules",
  structuring_rules: "structure_rules",
  visual_aids: "visual_aids",
  audio_aids: "audio_aids",
  exercise_adaptations: "exercise_adaptations",
  evaluation_rules: "evaluation_rules",
};

export const TEACHER_COLUMN_TO_STRATEGY_KEY: Record<TeacherDimensionColumn, StrategyDimensionKey> = {
  custom_pedagogical_objectives: "objectives",
  custom_linguistic_rules: "linguistic_rules",
  custom_layout_rules: "layout_rules",
  custom_structuring_rules: "structure_rules",
  custom_visual_aids: "visual_aids",
  custom_audio_aids: "audio_aids",
  custom_exercise_adaptations: "exercise_adaptations",
  custom_evaluation_rules: "evaluation_rules",
};

export interface ProfileDimensionSectionMeta {
  id: StrategyDimensionKey;
  systemColumn: SystemDimensionColumn;
  teacherColumn: TeacherDimensionColumn;
  title: string;
  description: string;
  placeholder: string;
}

export const PROFILE_DIMENSION_SECTIONS: ProfileDimensionSectionMeta[] = [
  {
    id: "objectives",
    systemColumn: "pedagogical_objectives",
    teacherColumn: "custom_pedagogical_objectives",
    title: "Objectifs pédagogiques",
    description: "Définissez ce que ce profil cherche à améliorer chez l'apprenant.",
    placeholder: "Ex. Réduire la charge cognitive",
  },
  {
    id: "linguistic_rules",
    systemColumn: "linguistic_rules",
    teacherColumn: "custom_linguistic_rules",
    title: "Règles linguistiques",
    description: "Formulations, vocabulaire et style de langage à appliquer.",
    placeholder: "Ex. Phrases courtes et vocabulaire simple",
  },
  {
    id: "layout_rules",
    systemColumn: "layout_rules",
    teacherColumn: "custom_layout_rules",
    title: "Règles de mise en page",
    description: "Présentation visuelle du texte et de la page.",
    placeholder: "Ex. Texte aéré avec paragraphes courts",
  },
  {
    id: "structure_rules",
    systemColumn: "structuring_rules",
    teacherColumn: "custom_structuring_rules",
    title: "Règles de structuration",
    description: "Organisation du contenu et repères pédagogiques.",
    placeholder: "Ex. Résumer chaque section",
  },
  {
    id: "visual_aids",
    systemColumn: "visual_aids",
    teacherColumn: "custom_visual_aids",
    title: "Aides visuelles",
    description: "Schémas, pictogrammes et repères visuels.",
    placeholder: "Ex. Schéma simplifié des étapes clés",
  },
  {
    id: "audio_aids",
    systemColumn: "audio_aids",
    teacherColumn: "custom_audio_aids",
    title: "Aides audio",
    description: "Supports sonores et scripts de lecture.",
    placeholder: "Ex. Proposer une version audio du résumé",
  },
  {
    id: "exercise_adaptations",
    systemColumn: "exercise_adaptations",
    teacherColumn: "custom_exercise_adaptations",
    title: "Adaptations des exercices",
    description: "Formats d'activités et types de questions.",
    placeholder: "Ex. Privilégier les QCM",
  },
  {
    id: "evaluation_rules",
    systemColumn: "evaluation_rules",
    teacherColumn: "custom_evaluation_rules",
    title: "Règles d'évaluation",
    description: "Critères et modalités d'évaluation adaptées.",
    placeholder: "Ex. Questions courtes avec feedback immédiat",
  },
];
