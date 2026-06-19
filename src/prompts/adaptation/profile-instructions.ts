export const PROFILE_INSTRUCTIONS: Record<string, string> = {
  dyslexie: "Phrases courtes. Espacement aéré. Mots difficiles en gras. Évite les homophones. Ajoute des repères visuels.",
  dysorthographie: "Vocabulaire simplifié. Listes structurées. Rappels orthographiques pour mots clés.",
  dyspraxie: "Consignes courtes numérotées. Une action par étape. Moins de copie, plus de compréhension.",
  dysphasie: "Vocabulaire concret. Phrases simples sujet-verbe-complément. Répétition des concepts clés.",
  tdah: "Segments courts. Titres visibles. Une idée par paragraphe. Questions de relance régulières.",
  tsa: "Structure prévisible. Consignes explicites. Évite le langage figuré. Annoncer le plan.",
  handicap_moteur: "Contenu accessible sans manipulation fine. Privilégier lecture et compréhension orale.",
  deficience_visuelle: "Descriptions verbales précises. Hiérarchie claire. Compatible lecture vocale.",
  deficience_auditive: "Contenu visuel et textuel riche. Vocabulaire écrit explicite. Pas de dépendance à l'oral seul.",
  allophone: "Français simplifié (FLE). Définir chaque terme technique. Traductions contextuelles si utile.",
  difficultes_apprentissage: "Découpage progressif. Exemples concrets. Rappels et reformulations.",
  hpi: "Approfondissements optionnels. Liens interdisciplinaires. Éviter la répétition inutile.",
  falc: "FALC strict : max 12 mots par phrase, une idée par phrase, vocabulaire courant, listes, exemples concrets, voix active.",
  personnalise: "Adapter selon les besoins pédagogiques spécifiques décrits dans le profil.",
};

export function getProfileInstructions(slugs: string[]): string {
  return slugs
    .map((slug) => `- ${slug}: ${PROFILE_INSTRUCTIONS[slug] ?? PROFILE_INSTRUCTIONS.personnalise}`)
    .join("\n");
}
