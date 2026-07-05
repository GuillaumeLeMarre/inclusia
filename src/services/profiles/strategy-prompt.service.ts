import type { PedagogicalStrategy } from "@/types/pedagogical-strategy";

function section(title: string, items: string[]): string | null {
  if (items.length === 0) return null;
  return `${title} :\n${items.map((item) => `- ${item}`).join("\n")}`;
}

/** Construit le bloc prompt à partir d'une stratégie structurée (pas de texte hardcodé géant). */
export function strategyToPromptBlock(strategy: PedagogicalStrategy): string {
  const parts = [
    section("Objectifs pédagogiques", strategy.objectives),
    section("Règles linguistiques", strategy.linguistic_rules),
    section("Règles de mise en page", strategy.layout_rules),
    section("Règles de structuration", strategy.structure_rules),
    section("Aides visuelles", strategy.visual_aids),
    section("Aides audio", strategy.audio_aids),
    section("Adaptations des exercices", strategy.exercise_adaptations),
    section("Règles d'évaluation", strategy.evaluation_rules),
    strategy.avoid?.length
      ? section("À éviter", strategy.avoid)
      : null,
  ].filter(Boolean);

  return parts.join("\n\n");
}

export function strategyToLegacyRulesText(strategy: PedagogicalStrategy): string {
  return [
    ...strategy.linguistic_rules,
    ...strategy.structure_rules.slice(0, 2),
  ].join(". ");
}
