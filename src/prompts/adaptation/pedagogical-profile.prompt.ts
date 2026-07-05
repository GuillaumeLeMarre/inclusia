import { ADAPTATION_SYSTEM_PROMPT } from "@/prompts/adaptation/system.prompt";

/** Prompt système unique pour tous les profils — la personnalisation vient de la stratégie structurée. */
export const PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT = `${ADAPTATION_SYSTEM_PROMPT}

Instructions complémentaires :
- Applique strictement la stratégie pédagogique structurée fournie ci-dessous (objectifs, règles linguistiques, mise en page, structuration, aides visuelles et audio, exercices, évaluation).
- Adapte le ton, la longueur des phrases, la mise en page et les supports selon chaque section de la stratégie.
- Respecte les contraintes « À éviter » si elles sont présentes.`;
