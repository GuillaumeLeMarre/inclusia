import type { DiagramType } from "@/types/mindmap";

function cleanTitle(text: string): string {
  const line = text.split("\n").find((l) => l.trim()) ?? "Cours";
  return line.replace(/^#+\s*/, "").replace(/[()]/g, "").slice(0, 50).trim() || "Cours";
}

export function buildDemoMermaidCode(type: DiagramType, courseText: string): string {
  const title = cleanTitle(courseText);

  switch (type) {
    case "timeline":
      return `timeline
  title ${title}
  section Période ancienne
    Événement clé : Début du sujet
  section Période centrale
    Événement clé : Tournant important
  section Période récente
    Événement clé : Conséquences actuelles`;

    case "graph":
      return `graph TD
  sujet["${title}"]
  cause["Cause principale"]
  effet["Conséquence"]
  cycle["Étape du cycle"]
  sujet --> cause
  cause --> effet
  effet --> cycle
  cycle --> sujet`;

    case "flowchart":
      return `flowchart TD
  start(["${title}"])
  etapeA["Lire la consigne"]
  etapeB["Appliquer la méthode"]
  etapeC["Vérifier le résultat"]
  start --> etapeA
  etapeA --> etapeB
  etapeB --> etapeC`;

    case "concept_map":
      return `graph TD
  centre["${title}"]
  notionA["Concept A"]
  notionB["Concept B"]
  notionC["Concept C"]
  centre -- "exemple de" --> notionA
  centre -- "lié à" --> notionB
  notionA -- "complète" --> notionC
  notionB -- "explique" --> notionC`;

    case "mindmap":
    default:
      return `mindmap
  root((${title}))
    Idées principales
      Points clés
      Exemples
    Vocabulaire
      Mots importants
    Vérification
      Quiz
      Fiche mémoire`;
  }
}
