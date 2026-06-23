import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { resolvePedagogicalProfile } from "@/services/profiles/profile-resolver.service";
import { buildProfileAdaptationPrompt } from "@/services/profiles/profile-prompt-builder.service";
import { generateAdaptationWithAI } from "@/services/ai/adaptation.ai.service";
import type { ProfileTestPromptInput } from "@/schemas/pedagogical-profile.schema";

export async function testProfilePrompt(
  client: SupabaseClient<Database>,
  input: ProfileTestPromptInput,
  teacherId?: string,
) {
  const resolved = await resolvePedagogicalProfile(client, {
    teacherProfileId: input.teacher_profile_id,
    pedagogicalProfileId: input.profile_id,
    slug: input.slug,
    teacherId,
  });

  const { system, user, profileSource, adaptationLevel, options } =
    buildProfileAdaptationPrompt({
      resolved,
      sourceText: input.source_text,
      documentTitle: "Test de prompt",
    });

  const output = await generateAdaptationWithAI(system, user);

  return {
    profileSource,
    adaptationLevel,
    options,
    profileName: resolved.name,
    systemPromptPreview: system.slice(0, 500),
    output,
  };
}
