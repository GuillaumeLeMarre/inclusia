import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  findAllPedagogicalProfiles,
  findPedagogicalProfileBySlug,
  insertPedagogicalProfile,
  updatePedagogicalProfile,
} from "@/repositories/pedagogical-profiles.repository";
import {
  createPedagogicalProfileVersionSnapshot,
} from "@/services/profiles/profile-version.service";
import {
  getFallbackProfiles,
  getFallbackStatus,
  seedToInsertPayload,
} from "@/services/profiles/fallback-profile.service";
import type { PedagogicalProfileInput } from "@/schemas/pedagogical-profile.schema";
import { normalizeOptions } from "@/services/profiles/fallback-profile.service";

export async function restoreSystemProfilesFromFallback(
  client: SupabaseClient<Database>,
  restoredBy: string,
): Promise<{ created: number; updated: number; skipped: number }> {
  const seeds = getFallbackProfiles();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const seed of seeds) {
    const existing = await findPedagogicalProfileBySlug(client, seed.slug);
    const payload = seedToInsertPayload(seed);

    if (!existing) {
      const inserted = await insertPedagogicalProfile(client, payload);
      await createPedagogicalProfileVersionSnapshot(
        client,
        inserted,
        restoredBy,
        "Création depuis fallback JSON",
      );
      created += 1;
      continue;
    }

    const needsUpdate =
      existing.system_prompt !== payload.system_prompt
      || existing.pedagogical_rules !== payload.pedagogical_rules
      || existing.name !== payload.name;

    if (needsUpdate) {
      await createPedagogicalProfileVersionSnapshot(
        client,
        existing,
        restoredBy,
        "Avant restauration fallback JSON",
      );
      await updatePedagogicalProfile(client, existing.id, payload);
      updated += 1;
    } else {
      skipped += 1;
    }
  }

  return { created, updated, skipped };
}

export async function getSystemProfilesRestoreStatus(client: SupabaseClient<Database>) {
  const dbCount = (await findAllPedagogicalProfiles(client, { includeInactive: true })).length;
  const fallback = getFallbackStatus();
  return {
    databaseCount: dbCount,
    fallbackCount: fallback.count,
    fallbackSlugs: fallback.slugs,
    inSync: dbCount >= fallback.count,
  };
}

export function mapPedagogicalProfileInput(input: PedagogicalProfileInput) {
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    description: input.description ?? null,
    system_prompt: input.system_prompt,
    user_prompt: input.user_prompt ?? "",
    pedagogical_rules: input.pedagogical_rules,
    adaptation_level: input.adaptation_level,
    options: normalizeOptions(input.options),
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  };
}

export async function createPedagogicalProfile(
  client: SupabaseClient<Database>,
  input: PedagogicalProfileInput,
  createdBy: string,
) {
  const payload = mapPedagogicalProfileInput(input);
  const profile = await insertPedagogicalProfile(client, payload);
  await createPedagogicalProfileVersionSnapshot(
    client,
    profile,
    createdBy,
    input.change_note ?? "Création initiale",
  );
  return profile;
}
