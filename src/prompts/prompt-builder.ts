import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Student } from "@/types";
import {
  ADAPTATION_OUTPUT_SCHEMA,
  ADAPTATION_SYSTEM_PROMPT,
} from "@/prompts/adaptation/system.prompt";
import { getProfileInstructions } from "@/prompts/adaptation/profile-instructions";

interface BuildPromptInput {
  student: Student;
  preferences: {
    audio_enabled: boolean;
    diagrams_enabled: boolean;
    quiz_enabled: boolean;
    simplified_text: boolean;
  } | null;
  profileSlugs: string[];
  sourceText: string;
  documentTitle: string;
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

  const user = `Document : "${input.documentTitle}"
Élève : ${input.student.first_name} ${input.student.last_name}
Classe : ${input.student.class_name ?? "N/A"}
Besoins : ${input.student.needs ?? "Non précisés"}
Profils d'adaptation :
${profileBlock}
${preferencesBlock}

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
