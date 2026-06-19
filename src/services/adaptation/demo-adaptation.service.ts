import { isDemoMode } from "@/lib/config";
import type { LearnerProfile } from "@/types";
import type {
  KeywordItem,
  MindmapData,
  QuizData,
} from "@/types";

export interface AdaptationOutput {
  adapted_content: string;
  summary: string;
  memory_sheet: string;
  quiz: QuizData;
  keywords: KeywordItem[];
  simplified_questions: string[];
  adapted_instructions: string;
  mindmap: MindmapData;
  audio_script: string;
}

export function generateDemoAdaptation(
  profile: LearnerProfile,
  documentTitle: string,
  sourceText: string,
  profileSlugs: string[],
): AdaptationOutput {
  const excerpt = sourceText.slice(0, 400) || "contenu pédagogique du cours";
  const slugs = profileSlugs.join(", ");
  const label = profile.profile_name;

  return {
    adapted_content: `# ${documentTitle} — Version adaptée (${label})

## Objectif de la séance
Comprendre les idées principales du cours de façon claire et accessible.

## Cours adapté

${excerpt}

### Points clés à retenir
1. **Idée principale** — Le cours explique les concepts essentiels de "${documentTitle}".
2. **Vocabulaire** — Les mots importants sont expliqués simplement.
3. **Exemple** — Un exemple concret aide à comprendre.

> Types d'adaptation appliqués : ${slugs}

## Pour aller plus loin
- Relire la fiche mémoire
- Faire le quiz ci-dessous`,

    summary: `Ce cours "${documentTitle}" a été simplifié selon le profil « ${label} ». Les idées principales sont présentées en phrases courtes, avec un vocabulaire accessible.`,

    memory_sheet: `📌 FICHE MÉMOIRE — ${documentTitle}

• Sujet : ${documentTitle}
• Profil : ${label}
• Objectif : Comprendre les points essentiels
• Méthode : Lire → Reformuler → Quiz
• Types : ${slugs}
• Astuce : Relire une section à la fois`,

    quiz: {
      questions: [
        {
          question: `Quel est le sujet principal de "${documentTitle}" ?`,
          options: [documentTitle, "Les mathématiques", "La géographie", "La musique"],
          correct_index: 0,
        },
        {
          question: "Comment vérifier que tu as compris ?",
          options: ["Faire le quiz", "Ignorer le cours", "Ne rien relire", "Copier sans lire"],
          correct_index: 0,
        },
        {
          question: "Que faire si un mot est difficile ?",
          options: ["Chercher sa définition", "Passer sans lire", "Abandonner", "Changer de sujet"],
          correct_index: 0,
        },
      ],
    },

    keywords: [
      { term: documentTitle.split(" ")[0] ?? "Concept", definition: "Mot clé principal du cours" },
      { term: "Compréhension", definition: "Capacité à expliquer avec ses propres mots" },
      { term: "Adaptation", definition: "Version du cours ajustée aux besoins pédagogiques" },
    ],

    simplified_questions: [
      "De quoi parle ce cours ?",
      "Quelle est l'idée la plus importante ?",
      "Peux-tu l'expliquer avec tes mots ?",
    ],

    adapted_instructions: `1. Lis le titre : ${documentTitle}\n2. Lis une section à la fois\n3. Souligne 3 mots importants\n4. Fais le quiz\n5. Indique si c'était trop long ou trop difficile`,

    mindmap: {
      nodes: [
        { id: "1", label: documentTitle, type: "concept" },
        { id: "2", label: "Idées principales", type: "concept" },
        { id: "3", label: "Vocabulaire clé", type: "concept" },
        { id: "4", label: "Quiz", type: "default" },
      ],
      links: [
        { source: "1", target: "2", label: "contient" },
        { source: "1", target: "3", label: "utilise" },
        { source: "2", target: "4", label: "vérifie" },
      ],
    },

    audio_script: `Bonjour. Aujourd'hui, nous allons travailler sur ${documentTitle}, avec le profil ${label}. Je vais t'expliquer les idées principales avec des phrases simples. Commence par lire le résumé, puis la fiche mémoire. Si tu as un doute, regarde le schéma ou fais le quiz.`,

  };
}

export function shouldUseDemoAi(): boolean {
  return isDemoMode();
}
