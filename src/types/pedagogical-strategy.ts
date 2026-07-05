/** Stratégie pédagogique structurée (bonnes pratiques accessibilité / FALC). */
export interface PedagogicalStrategy {
  objectives: string[];
  linguistic_rules: string[];
  layout_rules: string[];
  structure_rules: string[];
  visual_aids: string[];
  audio_aids: string[];
  exercise_adaptations: string[];
  evaluation_rules: string[];
  /** Formulations ou contenus à éviter (ex. FALC : passif, métaphores). */
  avoid?: string[];
}

export const EMPTY_PEDAGOGICAL_STRATEGY: PedagogicalStrategy = {
  objectives: [],
  linguistic_rules: [],
  layout_rules: [],
  structure_rules: [],
  visual_aids: [],
  audio_aids: [],
  exercise_adaptations: [],
  evaluation_rules: [],
  avoid: [],
};

/** Priorité de fusion multi-profils (plus élevé = règles linguistiques prioritaires). */
export const PROFILE_MERGE_PRIORITY: Record<string, number> = {
  falc: 100,
  lecture_simplifiee: 95,
  dyslexie: 90,
  deficience_visuelle: 88,
  deficience_auditive: 85,
  allophone: 82,
  tdah: 80,
  tsa: 78,
  dysphasie: 75,
  dyspraxie: 72,
  dysorthographie: 70,
  handicap_moteur: 65,
  difficultes_apprentissage: 60,
  hpi: 50,
  personnalise: 40,
};

export function getProfileMergePriority(slug: string): number {
  return PROFILE_MERGE_PRIORITY[slug] ?? 50;
}
