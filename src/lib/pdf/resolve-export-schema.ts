import { deserializeMindmapResult } from "@/lib/mermaid/parse-mermaid-response";
import type { Adaptation } from "@/types";
import type { MermaidGenerationResult } from "@/types/mindmap";

export function resolveExportSchema(adaptation: Adaptation): MermaidGenerationResult | null {
  const cached = adaptation.mindmap_mermaid?.trim();
  if (!cached) return null;
  return deserializeMindmapResult(cached);
}
