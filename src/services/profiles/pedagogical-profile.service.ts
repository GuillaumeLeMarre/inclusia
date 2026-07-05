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
  normalizeOptions,
} from "@/services/profiles/fallback-profile.service";
import type { PedagogicalProfileInput, PedagogicalProfilePatch } from "@/schemas/pedagogical-profile.schema";
import { parsePedagogicalDimensions } from "@/schemas/profile-rules.schema";
import { strategyFromDimensions } from "@/lib/profiles/strategy-columns";
import { DEFAULT_PROFILE_OPTIONS, type PedagogicalProfile } from "@/types/pedagogical-profile";
import { PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT } from "@/prompts/adaptation/pedagogical-profile.prompt";
import { strategyToLegacyRulesText } from "@/services/profiles/strategy-prompt.service";
import type { PedagogicalDimensions } from "@/types/pedagogical-dimensions";

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
      || existing.name !== payload.name
      || JSON.stringify(existing.pedagogical_objectives) !== JSON.stringify(payload.pedagogical_objectives)
      || JSON.stringify(existing.linguistic_rules) !== JSON.stringify(payload.linguistic_rules);

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

export function buildGeneratedPromptFields(
  dimensions: PedagogicalDimensions,
  avoid: string[] = [],
) {
  const strategy = strategyFromDimensions(dimensions, avoid);
  return {
    system_prompt: PEDAGOGICAL_ADAPTATION_SYSTEM_PROMPT,
    user_prompt: "",
    pedagogical_rules: strategyToLegacyRulesText(strategy),
    pedagogical_strategy: strategy,
  };
}

export function mapPedagogicalProfileInput(input: PedagogicalProfileInput) {
  const dimensions = parsePedagogicalDimensions(input);
  const generated = buildGeneratedPromptFields(
    dimensions,
    input.pedagogical_strategy?.avoid ?? [],
  );
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    description: input.description ?? null,
    system_prompt: generated.system_prompt,
    user_prompt: generated.user_prompt,
    pedagogical_rules: generated.pedagogical_rules,
    ...dimensions,
    pedagogical_strategy: generated.pedagogical_strategy,
    adaptation_level: input.adaptation_level ?? "standard",
    options: normalizeOptions(input.options ?? DEFAULT_PROFILE_OPTIONS),
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  };
}

export function enrichPedagogicalProfilePatch(
  patch: PedagogicalProfilePatch,
  current: PedagogicalProfile,
): PedagogicalProfilePatch {
  const mergedDimensions: PedagogicalDimensions = {
    pedagogical_objectives: patch.pedagogical_objectives ?? current.pedagogical_objectives,
    linguistic_rules: patch.linguistic_rules ?? current.linguistic_rules,
    layout_rules: patch.layout_rules ?? current.layout_rules,
    structuring_rules: patch.structuring_rules ?? current.structuring_rules,
    visual_aids: patch.visual_aids ?? current.visual_aids,
    audio_aids: patch.audio_aids ?? current.audio_aids,
    exercise_adaptations: patch.exercise_adaptations ?? current.exercise_adaptations,
    evaluation_rules: patch.evaluation_rules ?? current.evaluation_rules,
  };

  const generated = buildGeneratedPromptFields(
    mergedDimensions,
    patch.pedagogical_strategy?.avoid ?? current.pedagogical_strategy.avoid ?? [],
  );

  return {
    ...patch,
    system_prompt: generated.system_prompt,
    user_prompt: generated.user_prompt,
    pedagogical_rules: generated.pedagogical_rules,
    pedagogical_strategy: generated.pedagogical_strategy,
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
