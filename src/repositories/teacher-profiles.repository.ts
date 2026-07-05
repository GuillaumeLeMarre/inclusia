import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  ProfileOptions,
  TeacherProfile,
  TeacherProfileVersion,
} from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";
import { emptyStrategy } from "@/types/pedagogical-profile";
import {
  strategyFromTeacherDimensions,
  teacherDimensionsFromRow,
  teacherDimensionsToDbPayload,
} from "@/lib/profiles/strategy-columns";
import { EMPTY_TEACHER_DIMENSIONS } from "@/types/pedagogical-dimensions";

type Client = SupabaseClient<Database>;

function mapProfile(row: Record<string, unknown>): TeacherProfile {
  const dimensions = teacherDimensionsFromRow(row);
  return {
    id: row.id as string,
    teacher_id: row.teacher_id as string,
    source_profile_id: (row.source_profile_id as string | null) ?? null,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    custom_prompt: (row.custom_prompt as string | null) ?? null,
    custom_rules: (row.custom_rules as string | null) ?? null,
    ...dimensions,
    custom_strategy: strategyFromTeacherDimensions(dimensions),
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapVersion(row: Record<string, unknown>): TeacherProfileVersion {
  const dimensions = teacherDimensionsFromRow(row);
  return {
    id: row.id as string,
    profile_id: row.profile_id as string,
    version: row.version as number,
    source_profile_id: (row.source_profile_id as string | null) ?? null,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    custom_prompt: (row.custom_prompt as string | null) ?? null,
    custom_rules: (row.custom_rules as string | null) ?? null,
    ...dimensions,
    custom_strategy: strategyFromTeacherDimensions(dimensions),
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    change_note: (row.change_note as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function buildDbPayload(payload: Partial<TeacherProfile>): Record<string, unknown> {
  const hasDimensions = (
    Object.keys(EMPTY_TEACHER_DIMENSIONS) as (keyof typeof EMPTY_TEACHER_DIMENSIONS)[]
  ).some((key) => key in payload);

  if (!hasDimensions) return { ...payload };

  const dimensions = teacherDimensionsToDbPayload(payload);
  const strategy = strategyFromTeacherDimensions(dimensions);
  return { ...payload, ...dimensions, custom_strategy: strategy };
}

export async function findTeacherProfiles(
  client: Client,
  teacherId: string,
  options?: { includeInactive?: boolean },
): Promise<TeacherProfile[]> {
  let query = client
    .from("teacher_profiles")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

export async function findTeacherProfileById(
  client: Client,
  teacherId: string,
  id: string,
): Promise<TeacherProfile | null> {
  const { data, error } = await client
    .from("teacher_profiles")
    .select("*")
    .eq("id", id)
    .eq("teacher_id", teacherId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function insertTeacherProfile(
  client: Client,
  payload: Omit<TeacherProfile, "id" | "created_at" | "updated_at">,
): Promise<TeacherProfile> {
  const dbPayload = buildDbPayload(payload);
  const { custom_strategy, options, ...rest } = dbPayload;
  const { data, error } = await client
    .from("teacher_profiles")
    .insert({
      ...rest,
      options: options as unknown as Json,
      custom_strategy: (custom_strategy ?? emptyStrategy()) as unknown as Json,
      custom_pedagogical_objectives: rest.custom_pedagogical_objectives as unknown as Json,
      custom_linguistic_rules: rest.custom_linguistic_rules as unknown as Json,
      custom_layout_rules: rest.custom_layout_rules as unknown as Json,
      custom_structuring_rules: rest.custom_structuring_rules as unknown as Json,
      custom_visual_aids: rest.custom_visual_aids as unknown as Json,
      custom_audio_aids: rest.custom_audio_aids as unknown as Json,
      custom_exercise_adaptations: rest.custom_exercise_adaptations as unknown as Json,
      custom_evaluation_rules: rest.custom_evaluation_rules as unknown as Json,
    } as Database["public"]["Tables"]["teacher_profiles"]["Insert"])
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateTeacherProfile(
  client: Client,
  teacherId: string,
  id: string,
  payload: Partial<Omit<TeacherProfile, "id" | "teacher_id" | "created_at" | "updated_at">>,
): Promise<TeacherProfile> {
  const dbPayload = buildDbPayload(payload);
  const {
    options,
    custom_strategy,
    custom_pedagogical_objectives,
    custom_linguistic_rules,
    custom_layout_rules,
    custom_structuring_rules,
    custom_visual_aids,
    custom_audio_aids,
    custom_exercise_adaptations,
    custom_evaluation_rules,
    ...rest
  } = dbPayload;

  const { data, error } = await client
    .from("teacher_profiles")
    .update({
      ...rest,
      ...(options ? { options: options as unknown as Json } : {}),
      ...(custom_strategy ? { custom_strategy: custom_strategy as unknown as Json } : {}),
      ...(custom_pedagogical_objectives
        ? { custom_pedagogical_objectives: custom_pedagogical_objectives as unknown as Json }
        : {}),
      ...(custom_linguistic_rules
        ? { custom_linguistic_rules: custom_linguistic_rules as unknown as Json }
        : {}),
      ...(custom_layout_rules ? { custom_layout_rules: custom_layout_rules as unknown as Json } : {}),
      ...(custom_structuring_rules
        ? { custom_structuring_rules: custom_structuring_rules as unknown as Json }
        : {}),
      ...(custom_visual_aids ? { custom_visual_aids: custom_visual_aids as unknown as Json } : {}),
      ...(custom_audio_aids ? { custom_audio_aids: custom_audio_aids as unknown as Json } : {}),
      ...(custom_exercise_adaptations
        ? { custom_exercise_adaptations: custom_exercise_adaptations as unknown as Json }
        : {}),
      ...(custom_evaluation_rules
        ? { custom_evaluation_rules: custom_evaluation_rules as unknown as Json }
        : {}),
    })
    .eq("id", id)
    .eq("teacher_id", teacherId)
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function deleteTeacherProfile(
  client: Client,
  teacherId: string,
  id: string,
): Promise<void> {
  const { error } = await client
    .from("teacher_profiles")
    .delete()
    .eq("id", id)
    .eq("teacher_id", teacherId);
  if (error) throw error;
}

export async function getNextTeacherProfileVersion(
  client: Client,
  profileId: string,
): Promise<number> {
  const { data, error } = await client
    .from("teacher_profile_versions")
    .select("version")
    .eq("profile_id", profileId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.version ?? 0) + 1;
}

function versionInsertPayload(version: Omit<TeacherProfileVersion, "id" | "created_at">) {
  const dbPayload = buildDbPayload(version);
  return {
    profile_id: version.profile_id,
    version: version.version,
    source_profile_id: version.source_profile_id,
    name: version.name,
    description: version.description,
    custom_prompt: version.custom_prompt,
    custom_rules: version.custom_rules,
    adaptation_level: version.adaptation_level,
    is_active: version.is_active,
    change_note: version.change_note,
    created_by: version.created_by,
    options: version.options as unknown as Json,
    custom_strategy: (dbPayload.custom_strategy ?? emptyStrategy()) as unknown as Json,
    custom_pedagogical_objectives: dbPayload.custom_pedagogical_objectives as unknown as Json,
    custom_linguistic_rules: dbPayload.custom_linguistic_rules as unknown as Json,
    custom_layout_rules: dbPayload.custom_layout_rules as unknown as Json,
    custom_structuring_rules: dbPayload.custom_structuring_rules as unknown as Json,
    custom_visual_aids: dbPayload.custom_visual_aids as unknown as Json,
    custom_audio_aids: dbPayload.custom_audio_aids as unknown as Json,
    custom_exercise_adaptations: dbPayload.custom_exercise_adaptations as unknown as Json,
    custom_evaluation_rules: dbPayload.custom_evaluation_rules as unknown as Json,
  };
}

export async function insertTeacherProfileVersion(
  client: Client,
  version: Omit<TeacherProfileVersion, "id" | "created_at">,
): Promise<TeacherProfileVersion> {
  const { data, error } = await client
    .from("teacher_profile_versions")
    .insert(versionInsertPayload(version))
    .select("*")
    .single();
  if (error) throw error;
  return mapVersion(data);
}

export async function findTeacherProfileVersions(
  client: Client,
  profileId: string,
): Promise<TeacherProfileVersion[]> {
  const { data, error } = await client
    .from("teacher_profile_versions")
    .select("*")
    .eq("profile_id", profileId)
    .order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVersion);
}

export async function findTeacherProfileVersion(
  client: Client,
  profileId: string,
  version: number,
): Promise<TeacherProfileVersion | null> {
  const { data, error } = await client
    .from("teacher_profile_versions")
    .select("*")
    .eq("profile_id", profileId)
    .eq("version", version)
    .maybeSingle();
  if (error) throw error;
  return data ? mapVersion(data) : null;
}
