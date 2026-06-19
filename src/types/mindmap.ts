export type DiagramType =
  | "timeline"
  | "mindmap"
  | "graph"
  | "flowchart"
  | "concept_map";

export interface MermaidGenerationResult {
  diagramType: DiagramType;
  title: string;
  mermaidCode: string;
  explanation: string;
}
