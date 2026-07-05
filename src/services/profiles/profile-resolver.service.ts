import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ResolvedPedagogicalProfile, ProfileOptions } from "@/types/pedagogical-profile";
import { emptyStrategy } from "@/types/pedagogical-profile";
import type { AdaptationLevel } from "@/types/adaptation-level";
import {
  findPedagogicalProfileById,
  findPedagogicalProfileBySlug,
} from "@/repositories/pedagogical-profiles.repository";
import { findTeacherProfileById } from "@/repositories/teacher-profiles.repository";
import {
  fallbackToResolved,
  getFallbackProfileBySlug,
  normalizeOptions,
  profileToResolved,
} from "@/services/profiles/fallback-profile.service";
import {
  mergePedagogicalStrategies,
  mergeWithTeacherCustomization,
} from "@/services/profiles/strategy-merge.service";
import { strategyToLegacyRulesText } from "@/services/profiles/strategy-prompt.service";

export interface ResolveProfileInput {
  teacherProfileId?: string | null;
  pedagogicalProfileId?: string | null;
  pedagogicalProfileIds?: string[];
  slug?: string | null;
  slugs?: string[];
  teacherId?: string;
}

export class ProfileResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileResolutionError";
  }
}

function mergeOptionsList(options: ProfileOptions[]): ProfileOptions {
  return {
    generate_summary: options.some((o) => o.generate_summary),
    generate_quiz: options.some((o) => o.generate_quiz),
    generate_mindmap: options.some((o) => o.generate_mindmap),
    generate_audio: options.some((o) => o.generate_audio),
    generate_falc: options.some((o) => o.generate_falc),
  };
}

function strictestLevel(levels: AdaptationLevel[]): AdaptationLevel {
  if (levels.includes("falc")) return "falc";
  if (levels.includes("simplified")) return "simplified";
  return "standard";
}

async function loadSystemProfileBySlug(
  client: SupabaseClient<Database>,
  slug: string,
): Promise<ResolvedPedagogicalProfile> {
  const profile = await findPedagogicalProfileBySlug(client, slug);
  if (profile?.is_active) return profileToResolved(profile);

  const fallback = getFallbackProfileBySlug(slug);
  if (fallback?.is_active) return fallbackToResolved(fallback);

  throw new ProfileResolutionError(`Profil « ${slug} » introuvable`);
}

async function loadSystemProfileById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<ResolvedPedagogicalProfile> {
  const profile = await findPedagogicalProfileById(client, id);
  if (profile?.is_active) return profileToResolved(profile);
  throw new ProfileResolutionError("Profil système introuvable");
}

async function resolveMergedSystemProfiles(
  client: SupabaseClient<Database>,
  slugs: string[],
): Promise<ResolvedPedagogicalProfile> {
  if (slugs.length === 0) {
    throw new ProfileResolutionError("Aucun profil pédagogique spécifié");
  }

  const resolvedList = await Promise.all(
    slugs.map((slug) => loadSystemProfileBySlug(client, slug)),
  );

  const merged = mergePedagogicalStrategies(
    resolvedList.map((r) => ({
      slug: r.slug ?? "unknown",
      name: r.name,
      strategy: r.mergedStrategy,
    })),
  );

  const names = resolvedList.map((r) => r.name).join(" + ");
  const levels = resolvedList.map((r) => r.adaptationLevel);

  return {
    source: resolvedList.every((r) => r.source === "FALLBACK_PROFILE")
      ? "FALLBACK_PROFILE"
      : "SYSTEM_PROFILE",
    profileId: resolvedList.map((r) => r.profileId).join("+"),
    slug: resolvedList[0]?.slug ?? null,
    slugs,
    name: names,
    systemPrompt: resolvedList.map((r) => r.systemPrompt).filter(Boolean).join("\n"),
    userPrompt: resolvedList.map((r) => r.userPrompt).filter(Boolean).join("\n"),
    pedagogicalRules: strategyToLegacyRulesText(merged),
    mergedStrategy: merged,
    customPrompt: null,
    customRules: null,
    adaptationLevel: strictestLevel(levels),
    options: mergeOptionsList(resolvedList.map((r) => r.options)),
  };
}

export async function resolvePedagogicalProfile(
  client: SupabaseClient<Database>,
  input: ResolveProfileInput,
): Promise<ResolvedPedagogicalProfile> {
  const slugList = [
    ...(input.slugs ?? []),
    ...(input.slug ? [input.slug] : []),
  ].filter((s, i, arr) => arr.indexOf(s) === i);

  if (input.pedagogicalProfileIds?.length) {
    const byIds = await Promise.all(
      input.pedagogicalProfileIds.map((id) => loadSystemProfileById(client, id)),
    );
    slugList.push(...byIds.map((r) => r.slug).filter(Boolean) as string[]);
  }

  let systemBase: ResolvedPedagogicalProfile;

  if (slugList.length > 1) {
    systemBase = await resolveMergedSystemProfiles(client, slugList);
  } else if (slugList.length === 1) {
    systemBase = await loadSystemProfileBySlug(client, slugList[0]!);
  } else if (input.pedagogicalProfileId) {
    systemBase = await loadSystemProfileById(client, input.pedagogicalProfileId);
  } else {
    throw new ProfileResolutionError("Aucun profil pédagogique spécifié");
  }

  if (!input.teacherProfileId || !input.teacherId) {
    return systemBase;
  }

  const teacherProfile = await findTeacherProfileById(
    client,
    input.teacherId,
    input.teacherProfileId,
  );
  if (!teacherProfile) {
    throw new ProfileResolutionError("Profil personnel introuvable");
  }

  const teacherStrategy = teacherProfile.custom_strategy;
  const hasTeacherDimensions =
    teacherStrategy.objectives.length > 0
    || teacherStrategy.linguistic_rules.length > 0
    || teacherStrategy.layout_rules.length > 0
    || teacherStrategy.structure_rules.length > 0
    || teacherStrategy.visual_aids.length > 0
    || teacherStrategy.audio_aids.length > 0
    || teacherStrategy.exercise_adaptations.length > 0
    || teacherStrategy.evaluation_rules.length > 0;

  const mergedStrategy = mergeWithTeacherCustomization(
    systemBase.mergedStrategy,
    teacherProfile.custom_rules,
    hasTeacherDimensions ? teacherStrategy : null,
  );

  return {
    source: "TEACHER_PROFILE",
    profileId: teacherProfile.id,
    slug: systemBase.slug,
    slugs: systemBase.slugs,
    name: teacherProfile.name,
    systemPrompt: systemBase.systemPrompt,
    userPrompt: systemBase.userPrompt,
    pedagogicalRules: strategyToLegacyRulesText(mergedStrategy),
    mergedStrategy,
    customPrompt: teacherProfile.custom_prompt,
    customRules: teacherProfile.custom_rules,
    adaptationLevel: teacherProfile.adaptation_level,
    options: normalizeOptions({
      ...systemBase.options,
      ...teacherProfile.options,
    }),
  };
}
