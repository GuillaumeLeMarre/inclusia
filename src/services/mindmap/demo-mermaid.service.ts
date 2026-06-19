import { buildDemoMermaidCode } from "@/lib/mermaid/demo-templates";
import {
  INFER_EXPLANATIONS,
  inferDiagramTypeFromText,
} from "@/lib/mermaid/infer-diagram-type";
import { reconcileDiagramType } from "@/lib/mermaid/mermaid-utils";
import type { DiagramType, MermaidGenerationResult } from "@/types/mindmap";

function extractTitle(text: string): string {
  const line = text.split("\n").find((l) => l.trim()) ?? "Cours adapté";
  return line.replace(/^#+\s*/, "").slice(0, 50).trim() || "Cours adapté";
}

export function generateDemoMermaid(courseText: string): MermaidGenerationResult {
  const diagramType = inferDiagramTypeFromText(courseText);
  const mermaidCode = buildDemoMermaidCode(diagramType, courseText);

  return {
    diagramType: reconcileDiagramType(diagramType, mermaidCode),
    title: extractTitle(courseText),
    mermaidCode,
    explanation: INFER_EXPLANATIONS[diagramType],
  };
}

/** Alias explicite pour les tests par type de cours. */
export function generateDemoMermaidForType(
  courseText: string,
  forcedType: DiagramType,
): MermaidGenerationResult {
  const mermaidCode = buildDemoMermaidCode(forcedType, courseText);
  return {
    diagramType: reconcileDiagramType(forcedType, mermaidCode),
    title: extractTitle(courseText),
    mermaidCode,
    explanation: INFER_EXPLANATIONS[forcedType],
  };
}
