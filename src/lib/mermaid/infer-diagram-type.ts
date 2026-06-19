import type { DiagramType } from "@/types/mindmap";

/** Heuristique locale (mode démo / fallback) pour choisir le type de schéma. */
export function inferDiagramTypeFromText(text: string): DiagramType {
  const sample = text.slice(0, 4000).toLowerCase();

  const yearMatches = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g) ?? [];
  const hasChronology =
    yearMatches.length >= 2
    || /chronologie|frise|siècle|époque|période|date|historique|révolution|guerre|année/.test(sample);

  if (hasChronology) return "timeline";

  const hasProcedure =
    /étape|méthode|procédure|d'abord|dabord|ensuite|puis|enfin|comment résoudre|marche à suivre|consigne/.test(
      sample,
    );

  if (hasProcedure) return "flowchart";

  const hasMechanism =
    /cycle|cause|conséquence|mécanisme|processus|chaîne|transformation|photosynthèse|évaporation|système/.test(
      sample,
    );

  if (hasMechanism) return "graph";

  const hasConceptLinks =
    /relation|lié|liens entre|associe|concept|notions reliées|carte de concepts/.test(sample);

  if (hasConceptLinks && !hasChronology) return "concept_map";

  const hasCentralTheme =
    /notion|thème|définition|vocabulaire|grammaire|idée principale|parties du cours/.test(sample);

  if (hasCentralTheme) return "mindmap";

  if (text.trim().length < 120) return "mindmap";

  return "mindmap";
}

export const INFER_EXPLANATIONS: Record<DiagramType, string> = {
  timeline: "Le cours contient des repères temporels ou une chronologie.",
  mindmap: "Le cours organise une notion centrale et plusieurs sous-thèmes.",
  graph: "Le cours décrit un mécanisme, un cycle ou des relations de cause à effet.",
  flowchart: "Le cours présente une méthode ou des étapes à suivre.",
  concept_map: "Le cours relie plusieurs concepts entre eux sans ordre chronologique.",
};
