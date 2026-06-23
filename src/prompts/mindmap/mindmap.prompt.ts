/** Prompt court : le type est déjà suggéré côté serveur pour accélérer la réponse. */
export const MERMAID_SYSTEM_PROMPT = `Tu génères un schéma Mermaid pédagogique pour élèves à besoins spécifiques.

Réponds uniquement en JSON valide :
{"diagramType":"...","title":"...","mermaidCode":"...","explanation":"..."}

Règles :
- Utilise le diagramType indiqué par l'utilisateur sauf si manifestement incorrect.
- Max 20 nœuds, libellés courts, mots simples, pas de numéros visibles (1, 2, 3).
- timeline → syntaxe Mermaid timeline (format : ANNEE : description courte, une entrée par date)
- mindmap → syntaxe Mermaid mindmap ; nœud central : root(({titre du schéma})) — ne jamais afficher « root » comme libellé visible
- graph → graph TD
- flowchart → flowchart TD
- concept_map → graph TD avec liens nommés : A -- "relation" --> B
- mermaidCode : Mermaid valide uniquement, sans markdown.
- explanation : une phrase courte justifiant le type.`;

export const MERMAID_FALC_SYSTEM_APPEND = `
Mode FALC actif :
- Privilégier mindmap ou timeline uniquement.
- Maximum 10 nœuds au total.
- Libellés très courts (2 à 4 mots).
- Pas de relations complexes ni de sous-graphes.`;

export function buildMindmapUserPrompt(
  courseText: string,
  suggestedType: string,
  options?: { falcMode?: boolean },
): string {
  const falcHint = options?.falcMode
    ? "\n\nMode FALC : mindmap ou timeline simple, max 10 nœuds, libellés 2-4 mots."
    : "";

  const typeHint = options?.falcMode && !["mindmap", "timeline"].includes(suggestedType)
    ? "mindmap"
    : suggestedType;

  return `diagramType: ${typeHint}

Texte du cours :
${courseText}${falcHint}`;
}
