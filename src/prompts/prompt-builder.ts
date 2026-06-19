import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { LearnerProfile } from "@/types";
import {
  ADAPTATION_OUTPUT_SCHEMA,
  ADAPTATION_SYSTEM_PROMPT,
} from "@/prompts/adaptation/system.prompt";
import { getProfileInstructions } from "@/prompts/adaptation/profile-instructions";

import { FALC_SIMPLIFIED_LEVEL_HINT } from "@/prompts/falc/falc-system.prompt";
import type { AdaptationLevel } from "@/types/adaptation-level";

interface BuildPromptInput {
  profile: LearnerProfile;
  preferences: {
    audio_enabled: boolean;
    diagrams_enabled: boolean;
    quiz_enabled: boolean;
    simplified_text: boolean;
  } | null;
  profileSlugs: string[];
  sourceText: string;
  documentTitle: string;
  adaptationLevel?: AdaptationLevel;
  supabase?: SupabaseClient<Database>;
}

export async function buildAdaptationPrompt(input: BuildPromptInput) {
  const dbPrompt = input.supabase
    ? await loadActivePromptFromDb(input.supabase, input.profileSlugs[0])
    : null;

  const system = dbPrompt?.system ?? ADAPTATION_SYSTEM_PROMPT;
  const profileBlock = getProfileInstructions(input.profileSlugs);

  const preferencesBlock = input.preferences
    ? `Préférences : audio=${input.preferences.audio_enabled}, schémas=${input.preferences.diagrams_enabled}, quiz=${input.preferences.quiz_enabled}, texte simplifié=${input.preferences.simplified_text}`
    : "Préférences : non renseignées";

  const levelBlock =
    input.adaptationLevel === "simplified"
      ? `\n${FALC_SIMPLIFIED_LEVEL_HINT}\n`
      : input.adaptationLevel === "falc"
        ? "\nNiveau FALC : une version FALC complète sera produite après adaptation.\n"
        : "";

  const user = `Document : "${input.documentTitle}"
Profil d'adaptation : ${input.profile.profile_name}
Niveau approximatif : ${input.profile.approximate_level ?? "Non précisé"}
Besoins pédagogiques : ${input.profile.pedagogical_needs ?? "Non précisés"}
Notes pédagogiques : ${input.profile.notes ?? "Aucune"}
Types d'adaptation :
${profileBlock}
${preferencesBlock}
${levelBlock}
IMPORTANT : Ne jamais inventer ni utiliser de nom d'élève, de diagnostic médical ou de données nominatives.

Contenu source :
"""
${input.sourceText.slice(0, 12000)}
"""

Produis le JSON suivant :
${ADAPTATION_OUTPUT_SCHEMA}`;

  return { system, user };
}

async function loadActivePromptFromDb(
  supabase: SupabaseClient<Database>,
  profileSlug?: string,
) {
  if (!profileSlug) return null;

  const { data: template } = await supabase
    .from("adaptation_prompt_templates")
    .select("id, slug")
    .eq("slug", `adaptation-${profileSlug}`)
    .eq("is_active", true)
    .maybeSingle();

  if (!template) return null;

  const { data: version } = await supabase
    .from("adaptation_prompt_versions")
    .select("content")
    .eq("template_id", template.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!version?.content) return null;

  return { system: version.content };
}
