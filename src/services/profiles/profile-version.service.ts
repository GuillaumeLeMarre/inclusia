import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { PedagogicalProfile, TeacherProfile } from "@/types/pedagogical-profile";
import {
  getNextPedagogicalVersion,
  insertPedagogicalProfileVersion,
  updatePedagogicalProfile,
  findPedagogicalProfileById,
} from "@/repositories/pedagogical-profiles.repository";
import {
  getNextTeacherProfileVersion,
  insertTeacherProfileVersion,
  updateTeacherProfile,
  findTeacherProfileById,
} from "@/repositories/teacher-profiles.repository";
import type { PedagogicalProfilePatch, TeacherProfilePatch } from "@/schemas/pedagogical-profile.schema";

export async function createPedagogicalProfileVersionSnapshot(
  client: SupabaseClient<Database>,
  profile: PedagogicalProfile,
  createdBy: string | null,
  changeNote?: string,
): Promise<void> {
  const version = await getNextPedagogicalVersion(client, profile.id);
  await insertPedagogicalProfileVersion(client, {
    profile_id: profile.id,
    version,
    slug: profile.slug,
    name: profile.name,
    category: profile.category,
    description: profile.description,
    system_prompt: profile.system_prompt,
    user_prompt: profile.user_prompt,
    pedagogical_rules: profile.pedagogical_rules,
    pedagogical_objectives: profile.pedagogical_objectives,
    linguistic_rules: profile.linguistic_rules,
    layout_rules: profile.layout_rules,
    structuring_rules: profile.structuring_rules,
    visual_aids: profile.visual_aids,
    audio_aids: profile.audio_aids,
    exercise_adaptations: profile.exercise_adaptations,
    evaluation_rules: profile.evaluation_rules,
    pedagogical_strategy: profile.pedagogical_strategy,
    adaptation_level: profile.adaptation_level,
    options: profile.options,
    is_active: profile.is_active,
    sort_order: profile.sort_order,
    change_note: changeNote ?? null,
    created_by: createdBy,
  });
}

export async function restorePedagogicalProfileVersion(
  client: SupabaseClient<Database>,
  profileId: string,
  versionNumber: number,
  restoredBy: string,
): Promise<PedagogicalProfile> {
  const { findPedagogicalProfileVersion } = await import(
    "@/repositories/pedagogical-profiles.repository"
  );
  const version = await findPedagogicalProfileVersion(client, profileId, versionNumber);
  if (!version) throw new Error("Version introuvable");

  const current = await findPedagogicalProfileById(client, profileId);
  if (current) {
    await createPedagogicalProfileVersionSnapshot(
      client,
      current,
      restoredBy,
      `Avant restauration v${versionNumber}`,
    );
  }

  return updatePedagogicalProfile(client, profileId, {
    slug: version.slug,
    name: version.name,
    category: version.category,
    description: version.description,
    system_prompt: version.system_prompt,
    user_prompt: version.user_prompt,
    pedagogical_rules: version.pedagogical_rules,
    pedagogical_objectives: version.pedagogical_objectives,
    linguistic_rules: version.linguistic_rules,
    layout_rules: version.layout_rules,
    structuring_rules: version.structuring_rules,
    visual_aids: version.visual_aids,
    audio_aids: version.audio_aids,
    exercise_adaptations: version.exercise_adaptations,
    evaluation_rules: version.evaluation_rules,
    pedagogical_strategy: version.pedagogical_strategy,
    adaptation_level: version.adaptation_level,
    options: version.options,
    is_active: version.is_active,
    sort_order: version.sort_order,
  });
}

export async function patchPedagogicalProfileWithVersion(
  client: SupabaseClient<Database>,
  profileId: string,
  patch: PedagogicalProfilePatch,
  updatedBy: string,
): Promise<PedagogicalProfile> {
  const current = await findPedagogicalProfileById(client, profileId);
  if (!current) throw new Error("Profil introuvable");

  const { change_note, ...fields } = patch;
  await createPedagogicalProfileVersionSnapshot(client, current, updatedBy, change_note);

  return updatePedagogicalProfile(client, profileId, fields);
}

export async function createTeacherProfileVersionSnapshot(
  client: SupabaseClient<Database>,
  profile: TeacherProfile,
  createdBy: string | null,
  changeNote?: string,
): Promise<void> {
  const version = await getNextTeacherProfileVersion(client, profile.id);
  await insertTeacherProfileVersion(client, {
    profile_id: profile.id,
    version,
    source_profile_id: profile.source_profile_id,
    name: profile.name,
    description: profile.description,
    custom_prompt: profile.custom_prompt,
    custom_rules: profile.custom_rules,
    custom_pedagogical_objectives: profile.custom_pedagogical_objectives,
    custom_linguistic_rules: profile.custom_linguistic_rules,
    custom_layout_rules: profile.custom_layout_rules,
    custom_structuring_rules: profile.custom_structuring_rules,
    custom_visual_aids: profile.custom_visual_aids,
    custom_audio_aids: profile.custom_audio_aids,
    custom_exercise_adaptations: profile.custom_exercise_adaptations,
    custom_evaluation_rules: profile.custom_evaluation_rules,
    custom_strategy: profile.custom_strategy,
    adaptation_level: profile.adaptation_level,
    options: profile.options,
    is_active: profile.is_active,
    change_note: changeNote ?? null,
    created_by: createdBy,
  });
}

export async function restoreTeacherProfileVersion(
  client: SupabaseClient<Database>,
  teacherId: string,
  profileId: string,
  versionNumber: number,
  restoredBy: string,
): Promise<TeacherProfile> {
  const { findTeacherProfileVersion } = await import("@/repositories/teacher-profiles.repository");
  const version = await findTeacherProfileVersion(client, profileId, versionNumber);
  if (!version) throw new Error("Version introuvable");

  const current = await findTeacherProfileById(client, teacherId, profileId);
  if (current) {
    await createTeacherProfileVersionSnapshot(
      client,
      current,
      restoredBy,
      `Avant restauration v${versionNumber}`,
    );
  }

  return updateTeacherProfile(client, teacherId, profileId, {
    source_profile_id: version.source_profile_id,
    name: version.name,
    description: version.description,
    custom_prompt: version.custom_prompt,
    custom_rules: version.custom_rules,
    custom_pedagogical_objectives: version.custom_pedagogical_objectives,
    custom_linguistic_rules: version.custom_linguistic_rules,
    custom_layout_rules: version.custom_layout_rules,
    custom_structuring_rules: version.custom_structuring_rules,
    custom_visual_aids: version.custom_visual_aids,
    custom_audio_aids: version.custom_audio_aids,
    custom_exercise_adaptations: version.custom_exercise_adaptations,
    custom_evaluation_rules: version.custom_evaluation_rules,
    custom_strategy: version.custom_strategy,
    adaptation_level: version.adaptation_level,
    options: version.options,
    is_active: version.is_active,
  });
}

export async function patchTeacherProfileWithVersion(
  client: SupabaseClient<Database>,
  teacherId: string,
  profileId: string,
  patch: TeacherProfilePatch,
  updatedBy: string,
): Promise<TeacherProfile> {
  const current = await findTeacherProfileById(client, teacherId, profileId);
  if (!current) throw new Error("Profil introuvable");

  const { change_note, ...fields } = patch;
  await createTeacherProfileVersionSnapshot(client, current, updatedBy, change_note);

  return updateTeacherProfile(client, teacherId, profileId, fields);
}
