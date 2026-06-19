import type { MindmapData } from "@/types";

function safeId(id: string): string {
  return id.replace(/\W/g, "_") || "node";
}

function safeLabel(label: string): string {
  return label.replace(/"/g, "'").slice(0, 40);
}

/** Convertit l'ancien format JSON (nodes/links) en graph TD Mermaid. */
export function convertMindmapJsonToMermaid(data: MindmapData): string {
  if (!data.nodes?.length) {
    return "";
  }

  const idMap = new Map<string, string>();
  const lines = ["graph TD"];

  for (const node of data.nodes.slice(0, 20)) {
    const mid = safeId(node.id);
    idMap.set(node.id, mid);
    lines.push(`  ${mid}["${safeLabel(node.label)}"]`);
  }

  for (const link of data.links.slice(0, 20)) {
    const from = idMap.get(link.source);
    const to = idMap.get(link.target);
    if (from && to) {
      lines.push(`  ${from} --> ${to}`);
    }
  }

  return lines.join("\n");
}
