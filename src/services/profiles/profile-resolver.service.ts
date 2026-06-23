import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ResolvedPedagogicalProfile } from "@/types/pedagogical-profile";
import {
  findPedagogicalProfileById,
  findPedagogicalProfileBySlug,
} from "@/repositories/pedagogical-profiles.repository";
import { findTeacherProfileById } from "@/repositories/teacher-profiles.repository";
import {
  fallbackToResolved,
  getFallbackProfileBySlug,
  normalizeOptions,
  systemProfileToResolved,
} from "@/services/profiles/fallback-profile.service";

export interface ResolveProfileInput {
  teacherProfileId?: string | null;
  pedagogicalProfileId?: string | null;
  slug?: string | null;
  teacherId?: string;
}

export class ProfileResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileResolutionError";
  }
}

export async function resolvePedagogicalProfile(
  client: SupabaseClient<Database>,
  input: ResolveProfileInput,
): Promise<ResolvedPedagogicalProfile> {
  if (input.teacherProfileId && input.teacherId) {
    const teacherProfile = await findTeacherProfileById(
      client,
      input.teacherId,
      input.teacherProfileId,
    );
    if (!teacherProfile) {
      throw new ProfileResolutionError("Profil personnel introuvable");
    }

    let systemBase: ResolvedPedagogicalProfile | null = null;

    if (teacherProfile.source_profile_id) {
      systemBase = await resolveSystemProfile(client, {
        pedagogicalProfileId: teacherProfile.source_profile_id,
      });
    } else if (input.slug) {
      systemBase = await resolveSystemProfile(client, { slug: input.slug });
    }

    if (!systemBase) {
      throw new ProfileResolutionError(
        "Profil système source introuvable pour ce profil personnel",
      );
    }

    return {
      source: "TEACHER_PROFILE",
      profileId: teacherProfile.id,
      slug: systemBase.slug,
      name: teacherProfile.name,
      systemPrompt: systemBase.systemPrompt,
      userPrompt: systemBase.userPrompt,
      pedagogicalRules: systemBase.pedagogicalRules,
      customPrompt: teacherProfile.custom_prompt,
      customRules: teacherProfile.custom_rules,
      adaptationLevel: teacherProfile.adaptation_level,
      options: normalizeOptions({
        ...systemBase.options,
        ...teacherProfile.options,
      }),
    };
  }

  return resolveSystemProfile(client, {
    pedagogicalProfileId: input.pedagogicalProfileId,
    slug: input.slug,
  });
}

async function resolveSystemProfile(
  client: SupabaseClient<Database>,
  input: { pedagogicalProfileId?: string | null; slug?: string | null },
): Promise<ResolvedPedagogicalProfile> {
  if (input.pedagogicalProfileId) {
    const profile = await findPedagogicalProfileById(client, input.pedagogicalProfileId);
    if (profile?.is_active) return systemProfileToResolved(profile);
  }

  if (input.slug) {
    const profile = await findPedagogicalProfileBySlug(client, input.slug);
    if (profile?.is_active) return systemProfileToResolved(profile);

    const fallback = getFallbackProfileBySlug(input.slug);
    if (fallback?.is_active) return fallbackToResolved(fallback);
  }

  if (input.pedagogicalProfileId) {
    throw new ProfileResolutionError("Profil système introuvable");
  }

  if (input.slug) {
    const fallback = getFallbackProfileBySlug(input.slug);
    if (fallback) return fallbackToResolved(fallback);
    throw new ProfileResolutionError(`Profil « ${input.slug} » introuvable`);
  }

  throw new ProfileResolutionError("Aucun profil pédagogique spécifié");
}
