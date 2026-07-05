import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  PedagogicalProfile,
  PedagogicalProfileVersion,
  ProfileOptions,
} from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";
import {
  dimensionsFromRow,
  dimensionsToDbPayload,
  strategyFromProfileRow,
  strategyJsonFromDimensions,
} from "@/lib/profiles/strategy-columns";
import { EMPTY_PEDAGOGICAL_DIMENSIONS } from "@/types/pedagogical-dimensions";

type Client = SupabaseClient<Database>;

function mapDimensions(row: Record<string, unknown>) {
  return dimensionsFromRow(row);
}

function mapProfile(row: Record<string, unknown>): PedagogicalProfile {
  const dimensions = mapDimensions(row);
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    category: row.category as string,
    description: (row.description as string | null) ?? null,
    system_prompt: row.system_prompt as string,
    user_prompt: row.user_prompt as string,
    pedagogical_rules: row.pedagogical_rules as string,
    ...dimensions,
    pedagogical_strategy: strategyFromProfileRow(row),
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    sort_order: row.sort_order as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapVersion(row: Record<string, unknown>): PedagogicalProfileVersion {
  const dimensions = mapDimensions(row);
  return {
    id: row.id as string,
    profile_id: row.profile_id as string,
    version: row.version as number,
    slug: row.slug as string,
    name: row.name as string,
    category: row.category as string,
    description: (row.description as string | null) ?? null,
    system_prompt: row.system_prompt as string,
    user_prompt: row.user_prompt as string,
    pedagogical_rules: row.pedagogical_rules as string,
    ...dimensions,
    pedagogical_strategy: strategyFromProfileRow(row),
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    sort_order: (row.sort_order as number) ?? 0,
    change_note: (row.change_note as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function buildDbPayload(
  payload: Partial<PedagogicalProfile>,
): Record<string, unknown> {
  const hasDimensions = (
    Object.keys(EMPTY_PEDAGOGICAL_DIMENSIONS) as (keyof typeof EMPTY_PEDAGOGICAL_DIMENSIONS)[]
  ).some((key) => key in payload);

  if (!hasDimensions) return { ...payload };

  const dimensions = dimensionsToDbPayload(payload);
  const strategy = strategyJsonFromDimensions(
    dimensions,
    payload.pedagogical_strategy?.avoid ?? [],
  );
  return { ...payload, ...dimensions, pedagogical_strategy: strategy };
}

export async function findAllPedagogicalProfiles(
  client: Client,
  options?: { includeInactive?: boolean; category?: string; search?: string },
): Promise<PedagogicalProfile[]> {
  let query = client
    .from("pedagogical_profiles")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }
  if (options?.category) {
    query = query.eq("category", options.category);
  }

  const { data, error } = await query;
  if (error) throw error;

  let profiles = (data ?? []).map(mapProfile);
  if (options?.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    profiles = profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q)
        || p.slug.toLowerCase().includes(q)
        || (p.description?.toLowerCase().includes(q) ?? false),
    );
  }
  return profiles;
}

export async function findPedagogicalProfileById(
  client: Client,
  id: string,
): Promise<PedagogicalProfile | null> {
  const { data, error } = await client
    .from("pedagogical_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function findPedagogicalProfileBySlug(
  client: Client,
  slug: string,
): Promise<PedagogicalProfile | null> {
  const { data, error } = await client
    .from("pedagogical_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function insertPedagogicalProfile(
  client: Client,
  payload: Omit<PedagogicalProfile, "id" | "created_at" | "updated_at">,
): Promise<PedagogicalProfile> {
  const dbPayload = buildDbPayload(payload);
  const { pedagogical_strategy, options, ...rest } = dbPayload;
  const { data, error } = await client
    .from("pedagogical_profiles")
    .insert({
      ...rest,
      options: options as unknown as Json,
      pedagogical_strategy: pedagogical_strategy as unknown as Json,
      pedagogical_objectives: rest.pedagogical_objectives as unknown as Json,
      linguistic_rules: rest.linguistic_rules as unknown as Json,
      layout_rules: rest.layout_rules as unknown as Json,
      structuring_rules: rest.structuring_rules as unknown as Json,
      visual_aids: rest.visual_aids as unknown as Json,
      audio_aids: rest.audio_aids as unknown as Json,
      exercise_adaptations: rest.exercise_adaptations as unknown as Json,
      evaluation_rules: rest.evaluation_rules as unknown as Json,
    } as Database["public"]["Tables"]["pedagogical_profiles"]["Insert"])
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updatePedagogicalProfile(
  client: Client,
  id: string,
  payload: Partial<Omit<PedagogicalProfile, "id" | "created_at" | "updated_at">>,
): Promise<PedagogicalProfile> {
  const dbPayload = buildDbPayload(payload);
  const {
    options,
    pedagogical_strategy,
    pedagogical_objectives,
    linguistic_rules,
    layout_rules,
    structuring_rules,
    visual_aids,
    audio_aids,
    exercise_adaptations,
    evaluation_rules,
    ...rest
  } = dbPayload;

  const { data, error } = await client
    .from("pedagogical_profiles")
    .update({
      ...rest,
      ...(options ? { options: options as unknown as Json } : {}),
      ...(pedagogical_strategy
        ? { pedagogical_strategy: pedagogical_strategy as unknown as Json }
        : {}),
      ...(pedagogical_objectives
        ? { pedagogical_objectives: pedagogical_objectives as unknown as Json }
        : {}),
      ...(linguistic_rules ? { linguistic_rules: linguistic_rules as unknown as Json } : {}),
      ...(layout_rules ? { layout_rules: layout_rules as unknown as Json } : {}),
      ...(structuring_rules ? { structuring_rules: structuring_rules as unknown as Json } : {}),
      ...(visual_aids ? { visual_aids: visual_aids as unknown as Json } : {}),
      ...(audio_aids ? { audio_aids: audio_aids as unknown as Json } : {}),
      ...(exercise_adaptations
        ? { exercise_adaptations: exercise_adaptations as unknown as Json }
        : {}),
      ...(evaluation_rules ? { evaluation_rules: evaluation_rules as unknown as Json } : {}),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function deletePedagogicalProfile(client: Client, id: string): Promise<void> {
  const { error } = await client.from("pedagogical_profiles").delete().eq("id", id);
  if (error) throw error;
}

export async function getNextPedagogicalVersion(
  client: Client,
  profileId: string,
): Promise<number> {
  const { data, error } = await client
    .from("pedagogical_profile_versions")
    .select("version")
    .eq("profile_id", profileId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.version ?? 0) + 1;
}

function versionInsertPayload(version: Omit<PedagogicalProfileVersion, "id" | "created_at">) {
  const dbPayload = buildDbPayload(version);
  return {
    profile_id: version.profile_id,
    version: version.version,
    slug: version.slug,
    name: version.name,
    category: version.category,
    description: version.description,
    system_prompt: version.system_prompt,
    user_prompt: version.user_prompt,
    pedagogical_rules: version.pedagogical_rules,
    adaptation_level: version.adaptation_level,
    is_active: version.is_active,
    sort_order: version.sort_order,
    change_note: version.change_note,
    created_by: version.created_by,
    options: version.options as unknown as Json,
    pedagogical_strategy: dbPayload.pedagogical_strategy as unknown as Json,
    pedagogical_objectives: dbPayload.pedagogical_objectives as unknown as Json,
    linguistic_rules: dbPayload.linguistic_rules as unknown as Json,
    layout_rules: dbPayload.layout_rules as unknown as Json,
    structuring_rules: dbPayload.structuring_rules as unknown as Json,
    visual_aids: dbPayload.visual_aids as unknown as Json,
    audio_aids: dbPayload.audio_aids as unknown as Json,
    exercise_adaptations: dbPayload.exercise_adaptations as unknown as Json,
    evaluation_rules: dbPayload.evaluation_rules as unknown as Json,
  };
}

export async function insertPedagogicalProfileVersion(
  client: Client,
  version: Omit<PedagogicalProfileVersion, "id" | "created_at">,
): Promise<PedagogicalProfileVersion> {
  const { data, error } = await client
    .from("pedagogical_profile_versions")
    .insert(versionInsertPayload(version))
    .select("*")
    .single();
  if (error) throw error;
  return mapVersion(data);
}

export async function findPedagogicalProfileVersions(
  client: Client,
  profileId: string,
): Promise<PedagogicalProfileVersion[]> {
  const { data, error } = await client
    .from("pedagogical_profile_versions")
    .select("*")
    .eq("profile_id", profileId)
    .order("version", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVersion);
}

export async function findPedagogicalProfileVersion(
  client: Client,
  profileId: string,
  version: number,
): Promise<PedagogicalProfileVersion | null> {
  const { data, error } = await client
    .from("pedagogical_profile_versions")
    .select("*")
    .eq("profile_id", profileId)
    .eq("version", version)
    .maybeSingle();
  if (error) throw error;
  return data ? mapVersion(data) : null;
}

export async function countPedagogicalProfiles(client: Client): Promise<number> {
  const { count, error } = await client
    .from("pedagogical_profiles")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
