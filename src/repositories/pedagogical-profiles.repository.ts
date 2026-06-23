import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  PedagogicalProfile,
  PedagogicalProfileVersion,
  ProfileOptions,
} from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";

type Client = SupabaseClient<Database>;

function mapProfile(row: Record<string, unknown>): PedagogicalProfile {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    category: row.category as string,
    description: (row.description as string | null) ?? null,
    system_prompt: row.system_prompt as string,
    user_prompt: row.user_prompt as string,
    pedagogical_rules: row.pedagogical_rules as string,
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    sort_order: row.sort_order as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapVersion(row: Record<string, unknown>): PedagogicalProfileVersion {
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
    adaptation_level: row.adaptation_level as AdaptationLevel,
    options: row.options as ProfileOptions,
    is_active: row.is_active as boolean,
    sort_order: (row.sort_order as number) ?? 0,
    change_note: (row.change_note as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
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
  const { data, error } = await client
    .from("pedagogical_profiles")
    .insert({
      ...payload,
      options: payload.options as unknown as Json,
    })
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
  const { options, ...rest } = payload;
  const { data, error } = await client
    .from("pedagogical_profiles")
    .update({
      ...rest,
      ...(options ? { options: options as unknown as Json } : {}),
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

export async function insertPedagogicalProfileVersion(
  client: Client,
  version: Omit<PedagogicalProfileVersion, "id" | "created_at">,
): Promise<PedagogicalProfileVersion> {
  const { data, error } = await client
    .from("pedagogical_profile_versions")
    .insert({
      ...version,
      options: version.options as unknown as Json,
    })
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
