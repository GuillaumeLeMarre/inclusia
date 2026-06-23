import type { ResolvedPedagogicalProfile, ProfileOptions } from "@/types/pedagogical-profile";
import type { LearnerProfile } from "@/types";
import { ADAPTATION_OUTPUT_SCHEMA, ADAPTATION_SYSTEM_PROMPT } from "@/prompts/adaptation/system.prompt";
import { FALC_SIMPLIFIED_LEVEL_HINT } from "@/prompts/falc/falc-system.prompt";

interface BuildProfilePromptInput {
  resolved: ResolvedPedagogicalProfile;
  learnerProfile?: LearnerProfile | null;
  preferences?: {
    audio_enabled: boolean;
    diagrams_enabled: boolean;
    quiz_enabled: boolean;
    simplified_text: boolean;
  } | null;
  sourceText: string;
  documentTitle: string;
}

function formatOptionsBlock(options: ProfileOptions): string {
  return [
    `Résumé : ${options.generate_summary ? "oui" : "non"}`,
    `Quiz : ${options.generate_quiz ? "oui" : "non"}`,
    `Schéma : ${options.generate_mindmap ? "oui" : "non"}`,
    `Audio : ${options.generate_audio ? "oui" : "non"}`,
    `FALC : ${options.generate_falc ? "oui" : "non"}`,
  ].join(", ");
}

function buildSystemPrompt(resolved: ResolvedPedagogicalProfile): string {
  const parts = [
    ADAPTATION_SYSTEM_PROMPT,
    "",
    `Profil pédagogique : ${resolved.name}`,
    resolved.systemPrompt,
  ];

  if (resolved.source === "TEACHER_PROFILE") {
    parts.push("", "Règles système :", resolved.pedagogicalRules);
    parts.push("", "Options :", formatOptionsBlock(resolved.options));
    if (resolved.customRules?.trim()) {
      parts.push("", "Règles personnalisées :", resolved.customRules.trim());
    }
    if (resolved.customPrompt?.trim()) {
      parts.push("", "Prompt personnalisé enseignant :", resolved.customPrompt.trim());
    }
  } else {
    parts.push("", "Règles pédagogiques :", resolved.pedagogicalRules);
  }

  return parts.join("\n");
}

function buildUserPrompt(input: BuildProfilePromptInput): string {
  const { resolved, learnerProfile, preferences, sourceText, documentTitle } = input;

  const learnerBlock = learnerProfile
    ? `Contexte apprenant (anonyme) :
- Nom du profil : ${learnerProfile.profile_name}
- Niveau approximatif : ${learnerProfile.approximate_level ?? "Non précisé"}
- Besoins d'adaptation : ${learnerProfile.pedagogical_needs ?? "Non précisés"}
- Préférences pédagogiques : ${learnerProfile.notes ?? "Aucune"}`
    : "Contexte apprenant : non renseigné";

  const preferencesBlock = preferences
    ? `Préférences techniques : audio=${preferences.audio_enabled}, schémas=${preferences.diagrams_enabled}, quiz=${preferences.quiz_enabled}, texte simplifié=${preferences.simplified_text}`
    : "Préférences techniques : non renseignées";

  const levelBlock =
    resolved.adaptationLevel === "simplified"
      ? `\n${FALC_SIMPLIFIED_LEVEL_HINT}\n`
      : resolved.adaptationLevel === "falc"
        ? "\nNiveau FALC : une version FALC complète sera produite après adaptation.\n"
        : "";

  const profileUserHint = resolved.userPrompt.trim()
    ? `\nConsignes profil :\n${resolved.userPrompt.trim()}\n`
    : "";

  const optionsBlock =
    resolved.source !== "TEACHER_PROFILE"
      ? `\nOptions :\n${formatOptionsBlock(resolved.options)}\n`
      : "";

  return `Document : "${documentTitle}"
${learnerBlock}
${profileUserHint}${optionsBlock}
${preferencesBlock}
${levelBlock}
IMPORTANT : Ne jamais inventer ni utiliser de nom complet, de diagnostic médical ou de données nominatives.

Contenu source :
"""
${sourceText.slice(0, 12000)}
"""

Produis le JSON suivant :
${ADAPTATION_OUTPUT_SCHEMA}`;
}

export function buildProfileAdaptationPrompt(input: BuildProfilePromptInput) {
  return {
    system: buildSystemPrompt(input.resolved),
    user: buildUserPrompt(input),
    profileSource: input.resolved.source,
    adaptationLevel: input.resolved.adaptationLevel,
    options: input.resolved.options,
  };
}
