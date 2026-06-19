export const ADAPTATION_PROFILES = [
  { slug: "dyslexie", name: "Dyslexie", category: "learning" },
  { slug: "dysorthographie", name: "Dysorthographie", category: "learning" },
  { slug: "dyspraxie", name: "Dyspraxie", category: "motor" },
  { slug: "dysphasie", name: "Dysphasie", category: "language" },
  { slug: "tdah", name: "TDAH", category: "attention" },
  { slug: "tsa", name: "TSA", category: "social" },
  { slug: "handicap_moteur", name: "Handicap moteur", category: "motor" },
  { slug: "deficience_visuelle", name: "Déficience visuelle", category: "sensory" },
  { slug: "deficience_auditive", name: "Déficience auditive", category: "sensory" },
  { slug: "allophone", name: "Élève allophone", category: "language" },
  { slug: "difficultes_apprentissage", name: "Difficultés d'apprentissage", category: "learning" },
  { slug: "hpi", name: "HPI", category: "gifted" },
  { slug: "falc", name: "FALC", category: "accessibility" },
  { slug: "personnalise", name: "Profil personnalisé", category: "custom" },
] as const;

export type ProfileSlug = (typeof ADAPTATION_PROFILES)[number]["slug"];

export function getProfileName(slug: string): string {
  return ADAPTATION_PROFILES.find((p) => p.slug === slug)?.name ?? slug;
}
