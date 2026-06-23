import { abbreviateMindmapRootLabel } from "@/lib/mermaid/abbreviate-mindmap-root-label";
import { detectDiagramType } from "@/lib/mermaid/mermaid-utils";

const GENERIC_ROOT_LABELS = /^(root|root node|noeud central|nœud central|centre|center|cours|schéma|schema|mindmap|idée centrale|idee centrale)$/i;

function escapeMindmapLabel(label: string): string {
  return label.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
}

function shouldReplaceRootLabel(label: string): boolean {
  const trimmed = label.trim();
  if (!trimmed) return true;
  return GENERIC_ROOT_LABELS.test(trimmed);
}

function formatRootNodeLabel(label: string): string {
  return abbreviateMindmapRootLabel(escapeMindmapLabel(label));
}

function applyRootLabel(line: string, formattedLabel: string): string {
  const indent = line.match(/^(\s*)/)?.[1] ?? "";
  return `${indent}root((${formattedLabel}))`;
}

/** Remplace « root » et raccourcit le libellé du nœud central (mindmap Mermaid). */
export function normalizeMindmapRootLabel(
  mermaidCode: string,
  title?: string | null,
): string {
  if (detectDiagramType(mermaidCode) !== "mindmap") return mermaidCode;

  const fallbackTitle = formatRootNodeLabel(title?.trim() || "Idée centrale");
  const lines = mermaidCode.split("\n");
  if (!lines[0]?.trim().toLowerCase().startsWith("mindmap")) return mermaidCode;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (!line.trim()) continue;

    const doubleParen = line.match(/^(\s*)root\s*\(\(\s*(.*?)\s*\)\)\s*$/i);
    if (doubleParen) {
      const current = doubleParen[2]!.trim();
      const label = shouldReplaceRootLabel(current) ? fallbackTitle : formatRootNodeLabel(current);
      lines[index] = applyRootLabel(line, label);
      break;
    }

    const bareRoot = line.match(/^(\s*)root\s*$/i);
    if (bareRoot) {
      lines[index] = applyRootLabel(line, fallbackTitle);
      break;
    }

    const singleParen = line.match(/^(\s*)root\s*\(\s*(.*?)\s*\)\s*$/i);
    if (singleParen) {
      const current = singleParen[2]!.trim();
      const label = shouldReplaceRootLabel(current) ? fallbackTitle : formatRootNodeLabel(current);
      lines[index] = applyRootLabel(line, label);
      break;
    }

    break;
  }

  return lines.join("\n");
}
