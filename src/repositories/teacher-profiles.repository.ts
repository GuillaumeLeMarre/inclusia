import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  ProfileOptions,
  TeacherProfile,
  TeacherProfileVersion,
} from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";

type Client = SupabaseClient<Database>;

function mapProfile(row: Record<string, unknown>): TeacherProfile {
  return {
    id: row.id as string,
    teacher_id: row.teacher_id as string,
    source_profile_id: (row.source_profile_id as string | null) ?? null,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    custom_prompt: (row.custom_prompt as string | null) ?? null,
    custom_rules: (row.custom_rules as string | null) ?? null,
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapVersion(row: Record<string, unknown>): TeacherProfileVersion {
  return {
    id: row.id as string,
    profile_id: row.profile_id as string,
    version: row.version as number,
    source_profile_id: (row.source_profile_id as string | null) ?? null,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    custom_prompt: (row.custom_prompt as string | null) ?? null,
    custom_rules: (row.custom_rules as string | null) ?? null,
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    change_note: (row.change_note as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
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
  const { data, error } = await client
    .from("teacher_profiles")
    .insert({
      ...payload,
      options: payload.options as unknown as Json,
    })
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
  const { options, ...rest } = payload;
  const { data, error } = await client
    .from("teacher_profiles")
    .update({
      ...rest,
      ...(options ? { options: options as unknown as Json } : {}),
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

export async function insertTeacherProfileVersion(
  client: Client,
  version: Omit<TeacherProfileVersion, "id" | "created_at">,
): Promise<TeacherProfileVersion> {
  const { data, error } = await client
    .from("teacher_profile_versions")
    .insert({
      ...version,
      options: version.options as unknown as Json,
    })
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
