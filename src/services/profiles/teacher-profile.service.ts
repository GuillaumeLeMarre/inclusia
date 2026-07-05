import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { findPedagogicalProfileById } from "@/repositories/pedagogical-profiles.repository";
import {
  findTeacherProfileById,
  insertTeacherProfile,
} from "@/repositories/teacher-profiles.repository";
import {
  createTeacherProfileVersionSnapshot,
  patchTeacherProfileWithVersion,
} from "@/services/profiles/profile-version.service";
import { normalizeOptions } from "@/services/profiles/fallback-profile.service";
import { strategyFromTeacherDimensions } from "@/lib/profiles/strategy-columns";
import { EMPTY_TEACHER_DIMENSIONS } from "@/types/pedagogical-dimensions";
import { DEFAULT_PROFILE_OPTIONS } from "@/types/pedagogical-profile";
import type { TeacherProfileInput, TeacherProfilePatch } from "@/schemas/pedagogical-profile.schema";
import { parseTeacherCustomDimensions } from "@/schemas/profile-rules.schema";

function mapTeacherInput(teacherId: string, input: TeacherProfileInput) {
  const dimensions = parseTeacherCustomDimensions(input);
  return {
    teacher_id: teacherId,
    source_profile_id: input.source_profile_id ?? null,
    name: input.name,
    description: input.description ?? null,
    custom_prompt: input.custom_prompt ?? null,
    custom_rules: input.custom_rules ?? null,
    ...dimensions,
    custom_strategy: strategyFromTeacherDimensions(dimensions),
    adaptation_level: input.adaptation_level ?? "standard",
    options: normalizeOptions(input.options ?? DEFAULT_PROFILE_OPTIONS),
    is_active: input.is_active ?? true,
  };
}

export async function duplicateSystemProfileForTeacher(
  client: SupabaseClient<Database>,
  teacherId: string,
  sourceProfileId: string,
  name: string,
): Promise<ReturnType<typeof insertTeacherProfile>> {
  const source = await findPedagogicalProfileById(client, sourceProfileId);
  if (!source?.is_active) throw new Error("Profil système source introuvable");

  const profile = await insertTeacherProfile(client, {
    teacher_id: teacherId,
    source_profile_id: source.id,
    name,
    description: source.description,
    custom_prompt: null,
    custom_rules: null,
    ...EMPTY_TEACHER_DIMENSIONS,
    custom_strategy: strategyFromTeacherDimensions(EMPTY_TEACHER_DIMENSIONS),
    adaptation_level: source.adaptation_level,
    options: normalizeOptions(source.options),
    is_active: true,
  });

  await createTeacherProfileVersionSnapshot(
    client,
    profile,
    teacherId,
    `Duplication depuis ${source.name}`,
  );

  return profile;
}

export async function duplicateTeacherProfile(
  client: SupabaseClient<Database>,
  teacherId: string,
  sourceTeacherProfileId: string,
  name: string,
) {
  const source = await findTeacherProfileById(client, teacherId, sourceTeacherProfileId);
  if (!source) throw new Error("Profil source introuvable");

  const profile = await insertTeacherProfile(client, {
    teacher_id: teacherId,
    source_profile_id: source.source_profile_id,
    name,
    description: source.description,
    custom_prompt: source.custom_prompt,
    custom_rules: source.custom_rules,
    custom_pedagogical_objectives: [...source.custom_pedagogical_objectives],
    custom_linguistic_rules: [...source.custom_linguistic_rules],
    custom_layout_rules: [...source.custom_layout_rules],
    custom_structuring_rules: [...source.custom_structuring_rules],
    custom_visual_aids: [...source.custom_visual_aids],
    custom_audio_aids: [...source.custom_audio_aids],
    custom_exercise_adaptations: [...source.custom_exercise_adaptations],
    custom_evaluation_rules: [...source.custom_evaluation_rules],
    custom_strategy: source.custom_strategy,
    adaptation_level: source.adaptation_level,
    options: normalizeOptions(source.options),
    is_active: true,
  });

  await createTeacherProfileVersionSnapshot(
    client,
    profile,
    teacherId,
    `Duplication depuis ${source.name}`,
  );

  return profile;
}

export async function createTeacherProfile(
  client: SupabaseClient<Database>,
  teacherId: string,
  input: TeacherProfileInput,
) {
  const profile = await insertTeacherProfile(client, mapTeacherInput(teacherId, input));

  await createTeacherProfileVersionSnapshot(
    client,
    profile,
    teacherId,
    input.change_note ?? "Création initiale",
  );

  return profile;
}

export async function updateTeacherProfile(
  client: SupabaseClient<Database>,
  teacherId: string,
  profileId: string,
  patch: TeacherProfilePatch,
) {
  return patchTeacherProfileWithVersion(client, teacherId, profileId, patch, teacherId);
}

export function exportTeacherProfiles(
  profiles: Awaited<
    ReturnType<typeof import("@/repositories/teacher-profiles.repository").findTeacherProfiles>
  >,
) {
  return {
    version: 1 as const,
    exported_at: new Date().toISOString(),
    profiles: profiles.map((p) => ({
      name: p.name,
      description: p.description,
      source_profile_id: p.source_profile_id,
      custom_prompt: p.custom_prompt,
      custom_rules: p.custom_rules,
      custom_pedagogical_objectives: p.custom_pedagogical_objectives,
      custom_linguistic_rules: p.custom_linguistic_rules,
      custom_layout_rules: p.custom_layout_rules,
      custom_structuring_rules: p.custom_structuring_rules,
      custom_visual_aids: p.custom_visual_aids,
      custom_audio_aids: p.custom_audio_aids,
      custom_exercise_adaptations: p.custom_exercise_adaptations,
      custom_evaluation_rules: p.custom_evaluation_rules,
      adaptation_level: p.adaptation_level,
      options: p.options,
      is_active: p.is_active,
    })),
  };
}
