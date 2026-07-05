import type { PedagogicalStrategy } from "@/types/pedagogical-strategy";
import {
  EMPTY_PEDAGOGICAL_STRATEGY,
  getProfileMergePriority,
} from "@/types/pedagogical-strategy";

export interface StrategyWithSlug {
  slug: string;
  name: string;
  strategy: PedagogicalStrategy;
}

function mergeUniqueLists(lists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      const key = item.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(item.trim());
    }
  }
  return result;
}

/** Fusionne plusieurs stratégies (multi-profils). Priorité : FALC > dyslexie > TDAH > … */
export function mergePedagogicalStrategies(
  profiles: StrategyWithSlug[],
): PedagogicalStrategy {
  if (profiles.length === 0) return { ...EMPTY_PEDAGOGICAL_STRATEGY };

  const sorted = [...profiles].sort(
    (a, b) => getProfileMergePriority(b.slug) - getProfileMergePriority(a.slug),
  );

  const strategies = sorted.map((p) => p.strategy);

  return {
    objectives: mergeUniqueLists(strategies.map((s) => s.objectives)),
    linguistic_rules: mergeUniqueLists(strategies.map((s) => s.linguistic_rules)),
    layout_rules: mergeUniqueLists(strategies.map((s) => s.layout_rules)),
    structure_rules: mergeUniqueLists(strategies.map((s) => s.structure_rules)),
    visual_aids: mergeUniqueLists(strategies.map((s) => s.visual_aids)),
    audio_aids: mergeUniqueLists(strategies.map((s) => s.audio_aids)),
    exercise_adaptations: mergeUniqueLists(strategies.map((s) => s.exercise_adaptations)),
    evaluation_rules: mergeUniqueLists(strategies.map((s) => s.evaluation_rules)),
    avoid: mergeUniqueLists(strategies.map((s) => s.avoid ?? [])),
  };
}

/** Fusionne stratégie système + personnalisation enseignant (sans remplacer le système). */
export function mergeWithTeacherCustomization(
  systemStrategy: PedagogicalStrategy,
  customRules: string | null | undefined,
  customStrategy?: PedagogicalStrategy | null,
): PedagogicalStrategy {
  const teacherExtra: PedagogicalStrategy = customStrategy ?? {
    ...EMPTY_PEDAGOGICAL_STRATEGY,
    linguistic_rules: customRules
      ? customRules.split(/\n+/).map((l) => l.trim()).filter(Boolean)
      : [],
  };

  return mergePedagogicalStrategies([
    { slug: "system", name: "Système", strategy: systemStrategy },
    { slug: "teacher", name: "Enseignant", strategy: teacherExtra },
  ]);
}
