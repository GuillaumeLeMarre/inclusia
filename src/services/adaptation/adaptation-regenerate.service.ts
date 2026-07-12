import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { findAdaptationById } from "@/repositories/adaptations.repository";
import {
  runAdaptationEngine,
  type RunAdaptationInput,
} from "@/services/adaptation/adaptation.engine";
import type { Adaptation } from "@/types";
import type { ProfileSource } from "@/types/pedagogical-profile";

type Client = SupabaseClient<Database>;

type AdaptationForRegenerate = Adaptation & {
  teacher_profile_id?: string | null;
  pedagogical_profile_id?: string | null;
  profile_source?: ProfileSource | null;
};

function getRegenerateProfileSlugs(adaptation: AdaptationForRegenerate): string[] {
  const source = adaptation.pedagogical_profile_slugs.length > 0
    ? adaptation.pedagogical_profile_slugs
    : adaptation.profile_slugs;

  // « falc » est un niveau d'adaptation auto-ajouté à la création, pas un profil à fusionner.
  if (adaptation.adaptation_level === "falc") {
    return source.filter((slug) => slug !== "falc");
  }

  return [...source];
}

function buildSlugProfileFields(slugs: string[]): Partial<RunAdaptationInput> {
  if (slugs.length > 1) {
    return { pedagogicalProfileSlugs: slugs, profileSlugs: slugs };
  }
  if (slugs.length === 1) {
    return { pedagogicalProfileSlug: slugs[0], profileSlugs: slugs };
  }
  return { profileSlugs: [] };
}

function isCompositeProfileId(profileId: string | null | undefined): boolean {
  return Boolean(profileId?.includes("+"));
}

export function buildRegenerateInputFromAdaptation(
  adaptation: AdaptationForRegenerate,
  teacherId: string,
): RunAdaptationInput {
  const slugs = getRegenerateProfileSlugs(adaptation);
  const slugFields = buildSlugProfileFields(slugs);

  const base: RunAdaptationInput = {
    teacherId,
    profileId: adaptation.profile_id,
    documentId: adaptation.document_id,
    profileSlugs: slugFields.profileSlugs ?? adaptation.profile_slugs,
    adaptationLevel: adaptation.adaptation_level,
    productionOptions: adaptation.production_options,
    generatePictograms: adaptation.generate_pictograms,
    existingAdaptationId: adaptation.id,
  };

  if (adaptation.teacher_profile_id) {
    return {
      ...base,
      teacherProfileId: adaptation.teacher_profile_id,
      ...slugFields,
    };
  }

  if (
    adaptation.pedagogical_profile_id
    && !isCompositeProfileId(adaptation.pedagogical_profile_id)
    && !slugFields.pedagogicalProfileSlugs
  ) {
    return {
      ...base,
      pedagogicalProfileId: adaptation.pedagogical_profile_id,
      ...slugFields,
    };
  }

  if (slugFields.pedagogicalProfileSlug || slugFields.pedagogicalProfileSlugs) {
    return { ...base, ...slugFields };
  }

  return base;
}

export async function regenerateTeacherAdaptation(
  client: Client,
  teacherId: string,
  adaptationId: string,
) {
  const adaptation = await findAdaptationById(client, teacherId, adaptationId);
  const input = buildRegenerateInputFromAdaptation(adaptation, teacherId);
  return runAdaptationEngine(client, input);
}
