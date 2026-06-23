import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  findPedagogicalProfileById,
} from "@/repositories/pedagogical-profiles.repository";
import {
  findTeacherProfileById,
  insertTeacherProfile,
} from "@/repositories/teacher-profiles.repository";
import {
  createTeacherProfileVersionSnapshot,
  patchTeacherProfileWithVersion,
} from "@/services/profiles/profile-version.service";
import { normalizeOptions } from "@/services/profiles/fallback-profile.service";
import type { TeacherProfileInput, TeacherProfilePatch } from "@/schemas/pedagogical-profile.schema";

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
  const profile = await insertTeacherProfile(client, {
    teacher_id: teacherId,
    source_profile_id: input.source_profile_id ?? null,
    name: input.name,
    description: input.description ?? null,
    custom_prompt: input.custom_prompt ?? null,
    custom_rules: input.custom_rules ?? null,
    adaptation_level: input.adaptation_level,
    options: normalizeOptions(input.options),
    is_active: input.is_active ?? true,
  });

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

export function exportTeacherProfiles(profiles: Awaited<ReturnType<typeof import("@/repositories/teacher-profiles.repository").findTeacherProfiles>>) {
  return {
    version: 1 as const,
    exported_at: new Date().toISOString(),
    profiles: profiles.map((p) => ({
      name: p.name,
      description: p.description,
      source_profile_id: p.source_profile_id,
      custom_prompt: p.custom_prompt,
      custom_rules: p.custom_rules,
      adaptation_level: p.adaptation_level,
      options: p.options,
      is_active: p.is_active,
    })),
  };
}
