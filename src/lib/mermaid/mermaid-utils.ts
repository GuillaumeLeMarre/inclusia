export function sanitizeMermaidCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith("```")) {
    code = code
      .replace(/^```(?:mermaid)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "");
  }
  return code.trim();
}

export function detectDiagramType(mermaidCode: string): string {
  const firstLine = mermaidCode.trim().split("\n")[0]?.toLowerCase() ?? "";
  if (firstLine.startsWith("timeline")) return "timeline";
  if (firstLine.startsWith("mindmap")) return "mindmap";
  if (firstLine.includes("graph")) return "graph TD";
  return "diagram";
}

export function isValidMermaidStructure(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;
  const head = trimmed.split("\n")[0]?.toLowerCase() ?? "";
  return (
    head.startsWith("mindmap")
    || head.startsWith("timeline")
    || head.includes("graph")
  );
}
