import type { ResolvedPedagogicalProfile, ProfileOptions } from "@/types/pedagogical-profile";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";
import type { LearnerProfile } from "@/types";
import type { PedagogicalDimensions, TeacherCustomDimensions } from "@/types/pedagogical-dimensions";
import { strategyFromDimensions, strategyFromTeacherDimensions } from "@/lib/profiles/strategy-columns";
import { mergeWithTeacherCustomization } from "@/services/profiles/strategy-merge.service";
import { ADAPTATION_OUTPUT_SCHEMA } from "@/prompts/adaptation/system.prompt";
import { PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT } from "@/prompts/adaptation/pedagogical-profile.prompt";
import { FALC_SIMPLIFIED_LEVEL_HINT } from "@/prompts/falc/falc-system.prompt";
import { strategyToPromptBlock } from "@/services/profiles/strategy-prompt.service";

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

function buildProfileStrategyPromptBlock(resolved: ResolvedPedagogicalProfile): string {
  const strategyBlock = strategyToPromptBlock(resolved.mergedStrategy);
  const multiHint =
    resolved.slugs.length > 1
      ? `Profils combinés (fusion par priorité) : ${resolved.slugs.join(" + ")}`
      : "";

  const parts = [
    `Profil pédagogique : ${resolved.name}`,
    multiHint,
    strategyBlock,
  ];

  return parts.filter(Boolean).join("\n\n");
}

function buildSystemPrompt(resolved: ResolvedPedagogicalProfile): string {
  return [PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT, "", buildProfileStrategyPromptBlock(resolved)].join("\n");
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
        ? "\nNiveau FALC : produire une version FALC complète. Viser un score FALC élevé.\n"
        : "";

  const userParts: string[] = [];

  if (resolved.customPrompt?.trim()) {
    userParts.push("Personnalisation enseignant :", resolved.customPrompt.trim(), "");
  }

  userParts.push(
    `Document : "${documentTitle}"`,
    learnerBlock,
    preferencesBlock,
    levelBlock,
    "",
    "Contenus à générer :",
    formatOptionsBlock(resolved.options),
    "",
    "IMPORTANT : Ne jamais inventer ni utiliser de nom complet, de diagnostic médical ou de données nominatives.",
    "",
    "Contenu source :",
    `"""`,
    sourceText.slice(0, 12000),
    `"""`,
    "",
    "Produis le JSON suivant :",
    ADAPTATION_OUTPUT_SCHEMA,
  );

  return userParts.filter(Boolean).join("\n");
}

export function buildProfileSystemPromptPreview(input: {
  name: string;
  dimensions: PedagogicalDimensions;
  avoid?: string[];
}): string {
  const strategy = strategyFromDimensions(input.dimensions, input.avoid ?? []);
  const resolved: ResolvedPedagogicalProfile = {
    source: "SYSTEM_PROFILE",
    profileId: "",
    slug: null,
    slugs: [],
    name: input.name.trim() || "Profil sans nom",
    systemPrompt: "",
    userPrompt: "",
    pedagogicalRules: "",
    mergedStrategy: strategy,
    customPrompt: null,
    customRules: null,
    adaptationLevel: "standard",
    options: DEFAULT_PROFILE_OPTIONS,
  };
  return buildProfileStrategyPromptBlock(resolved);
}

export function buildTeacherProfileSystemPromptPreview(input: {
  name: string;
  sourceDimensions: PedagogicalDimensions;
  teacherDimensions: TeacherCustomDimensions;
}): string {
  const systemStrategy = strategyFromDimensions(input.sourceDimensions);
  const teacherStrategy = strategyFromTeacherDimensions(input.teacherDimensions);
  const merged = mergeWithTeacherCustomization(systemStrategy, null, teacherStrategy);

  const resolved: ResolvedPedagogicalProfile = {
    source: "TEACHER_PROFILE",
    profileId: "",
    slug: null,
    slugs: [],
    name: input.name.trim() || "Profil sans nom",
    systemPrompt: "",
    userPrompt: "",
    pedagogicalRules: "",
    mergedStrategy: merged,
    customPrompt: null,
    customRules: null,
    adaptationLevel: "standard",
    options: DEFAULT_PROFILE_OPTIONS,
  };
  return buildProfileStrategyPromptBlock(resolved);
}

export function buildProfileAdaptationPrompt(input: BuildProfilePromptInput) {
  return {
    system: buildSystemPrompt(input.resolved),
    user: buildUserPrompt(input),
    profileSource: input.resolved.source,
    adaptationLevel: input.resolved.adaptationLevel,
    options: input.resolved.options,
    mergedStrategy: input.resolved.mergedStrategy,
    profileSlugs: input.resolved.slugs,
  };
}
