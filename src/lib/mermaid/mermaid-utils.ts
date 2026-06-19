import type { DiagramType } from "@/types/mindmap";
import { normalizeDiagramType } from "@/lib/mermaid/diagram-types";

export function sanitizeMermaidCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith("```")) {
    code = code
      .replace(/^```(?:mermaid)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "");
  }
  return code.trim();
}

export function detectDiagramType(mermaidCode: string): DiagramType {
  const firstLine = mermaidCode.trim().split("\n")[0]?.toLowerCase() ?? "";

  if (firstLine.startsWith("timeline")) return "timeline";
  if (firstLine.startsWith("mindmap")) return "mindmap";
  if (firstLine.startsWith("flowchart")) return "flowchart";

  if (firstLine.includes("graph")) {
    const hasNamedLinks = /--\s*"[^"]+"\s*-->/.test(mermaidCode);
    return hasNamedLinks ? "concept_map" : "graph";
  }

  return "mindmap";
}

export function isValidMermaidStructure(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;
  const head = trimmed.split("\n")[0]?.toLowerCase() ?? "";
  return (
    head.startsWith("mindmap")
    || head.startsWith("timeline")
    || head.includes("graph")
    || head.startsWith("flowchart")
  );
}

export function reconcileDiagramType(
  declared: string,
  mermaidCode: string,
): DiagramType {
  const fromCode = detectDiagramType(mermaidCode);
  const fromDeclared = normalizeDiagramType(declared);
  if (fromDeclared === fromCode) return fromDeclared;
  // Priorité au code Mermaid réellement généré
  return fromCode;
}
