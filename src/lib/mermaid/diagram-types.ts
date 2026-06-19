import type { DiagramType } from "@/types/mindmap";

export const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  timeline: "Frise chronologique",
  mindmap: "Carte mentale",
  graph: "Organigramme (causes / processus)",
  flowchart: "Procédure étape par étape",
  concept_map: "Carte de concepts",
};

export function normalizeDiagramType(value: string): DiagramType {
  const v = value.toLowerCase().trim();
  if (v === "graph td" || v === "graph") return "graph";
  if (v === "flowchart td" || v === "flowchart") return "flowchart";
  if (v === "concept_map" || v === "concept map") return "concept_map";
  if (v === "timeline") return "timeline";
  if (v === "mindmap") return "mindmap";
  return "mindmap";
}

export function getDiagramTypeLabel(type: DiagramType | string): string {
  const normalized = normalizeDiagramType(type);
  return DIAGRAM_TYPE_LABELS[normalized];
}
