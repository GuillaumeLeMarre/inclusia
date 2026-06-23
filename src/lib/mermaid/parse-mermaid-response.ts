import { z } from "zod";
import type { DiagramType, MermaidGenerationResult } from "@/types/mindmap";
import { normalizeDiagramType } from "@/lib/mermaid/diagram-types";
import { detectDiagramType, isValidMermaidStructure, sanitizeMermaidCode } from "@/lib/mermaid/mermaid-utils";
import { normalizeMindmapRootLabel } from "@/lib/mermaid/normalize-mindmap-root-label";

const mermaidResultSchema = z.object({
  diagramType: z.string(),
  title: z.string().min(1),
  mermaidCode: z.string().min(1),
  explanation: z.string().min(1),
});

export function cleanJsonResponse(raw: string): string {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json|mermaid)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "");
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}

function toResult(parsed: z.infer<typeof mermaidResultSchema>): MermaidGenerationResult {
  const title = parsed.title.trim().slice(0, 80);
  const mermaidCode = normalizeMindmapRootLabel(
    sanitizeMermaidCode(parsed.mermaidCode),
    title,
  );
  const diagramType = normalizeDiagramType(parsed.diagramType);

  if (!isValidMermaidStructure(mermaidCode)) {
    throw new Error("Code Mermaid invalide dans la réponse IA.");
  }

  return {
    diagramType,
    title,
    mermaidCode,
    explanation: parsed.explanation.trim().slice(0, 300),
  };
}

export function parseMermaidAiResponse(raw: string): MermaidGenerationResult | null {
  if (!raw.trim()) return null;

  try {
    const json = JSON.parse(cleanJsonResponse(raw));
    const parsed = mermaidResultSchema.parse(json);
    return toResult(parsed);
  } catch {
    const code = sanitizeMermaidCode(raw);
    if (isValidMermaidStructure(code)) {
      const diagramType = normalizeDiagramType(detectDiagramType(code)) as DiagramType;
      const title = "Schéma du cours";
      return {
        diagramType,
        title,
        mermaidCode: normalizeMindmapRootLabel(code, title),
        explanation: "Schéma extrait directement de la réponse IA.",
      };
    }
    return null;
  }
}

export function serializeMindmapResult(result: MermaidGenerationResult): string {
  return JSON.stringify(result);
}

export function deserializeMindmapResult(cached: string): MermaidGenerationResult | null {
  const trimmed = cached.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{")) {
    const parsed = parseMermaidAiResponse(trimmed);
    if (parsed) return parsed;
  }

  const code = sanitizeMermaidCode(trimmed);
  if (!isValidMermaidStructure(code)) return null;

  return {
    diagramType: normalizeDiagramType(detectDiagramType(code)),
    title: "Schéma du cours",
    mermaidCode: normalizeMindmapRootLabel(code, "Schéma du cours"),
    explanation: "Schéma enregistré précédemment.",
  };
}
