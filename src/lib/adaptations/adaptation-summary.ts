import { ADAPTATION_LEVELS, type AdaptationLevel } from "@/types/adaptation-level";
import {
  ADAPTATION_PROFILES,
  getProfileName,
} from "@/lib/constants/profiles";
import { PROFILE_INSTRUCTIONS } from "@/prompts/adaptation/profile-instructions";
import type { Adaptation } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  learning: "Trouble d'apprentissage",
  motor: "Handicap moteur",
  language: "Trouble du langage",
  attention: "Trouble de l'attention",
  social: "TSA / Communication",
  sensory: "Trouble sensoriel",
  accessibility: "Accessibilité",
  gifted: "Haut potentiel",
  custom: "Profil personnalisé",
};

export interface ProfileAdaptationItem {
  slug: string;
  name: string;
  categoryLabel: string;
  measures: string[];
}

export interface AdaptationSummaryData {
  profileName?: string;
  documentTitle?: string;
  levelLabel: string;
  levelDescription: string;
  profiles: ProfileAdaptationItem[];
  extras: string[];
}

function parseInstructionBullets(instruction: string): string[] {
  return instruction
    .split(/(?<=[.!])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getCategoryLabel(slug: string): string {
  const profile = ADAPTATION_PROFILES.find((p) => p.slug === slug);
  if (!profile) return "Besoin spécifique";
  return CATEGORY_LABELS[profile.category] ?? "Besoin spécifique";
}

function getLevelInfo(level: AdaptationLevel) {
  const found = ADAPTATION_LEVELS.find((item) => item.value === level);
  return {
    label: found?.label ?? "Standard",
    description: found?.description ?? "Adaptation légère",
  };
}

function buildExtras(adaptation: Adaptation): string[] {
  const extras: string[] = [];

  if (adaptation.adaptation_level === "falc" && adaptation.falc_score != null) {
    extras.push(`Score qualité FALC : ${adaptation.falc_score}/100`);
  }
  if (adaptation.generate_pictograms) {
    extras.push("Pictogrammes ARASAAC pour illustrer les concepts clés");
  }
  if (adaptation.adaptation_level === "falc" || adaptation.mindmap_mermaid) {
    extras.push("Schéma visuel simplifié intégré au support");
  }
  if (adaptation.is_demo) {
    extras.push("Génération en mode démo (aperçu sans IA complète)");
  }

  return extras;
}

export function buildAdaptationSummary(
  adaptation: Adaptation,
  profileName?: string,
  documentTitle?: string,
): AdaptationSummaryData {
  const level = getLevelInfo(adaptation.adaptation_level);
  const uniqueSlugs = [...new Set(adaptation.profile_slugs)];

  const profiles: ProfileAdaptationItem[] = uniqueSlugs.map((slug) => {
    const instruction =
      PROFILE_INSTRUCTIONS[slug] ?? PROFILE_INSTRUCTIONS.personnalise;
    return {
      slug,
      name: getProfileName(slug),
      categoryLabel: getCategoryLabel(slug),
      measures: parseInstructionBullets(instruction),
    };
  });

  if (adaptation.adaptation_level === "simplified" && !uniqueSlugs.includes("falc")) {
    profiles.unshift({
      slug: "niveau-simplifie",
      name: "Niveau simplifié",
      categoryLabel: "Adaptation globale",
      measures: parseInstructionBullets(
        "Phrases plus courtes. Vocabulaire accessible. Structure pédagogique renforcée.",
      ),
    });
  }

  return {
    profileName,
    documentTitle,
    levelLabel: level.label,
    levelDescription: level.description,
    profiles,
    extras: buildExtras(adaptation),
  };
}
