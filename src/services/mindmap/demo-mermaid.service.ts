import { detectDiagramType } from "@/lib/mermaid/mermaid-utils";

export function generateDemoMermaid(courseText: string): {
  diagramType: string;
  mermaidCode: string;
} {
  const title = courseText.split("\n").find((l) => l.trim())?.slice(0, 40) ?? "Cours";

  const mermaidCode = `mindmap
  root((${title.replace(/[()]/g, "")}))
    Idées principales
      Concepts clés
      Exemples
    Vocabulaire
      Mots importants
    Vérification
      Quiz
      Fiche mémoire`;

  return {
    diagramType: detectDiagramType(mermaidCode),
    mermaidCode,
  };
}
