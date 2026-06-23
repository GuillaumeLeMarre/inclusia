import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { TeacherProfileEditor } from "@/features/profiles/components/teacher-profile-editor";
import { createClient } from "@/lib/supabase/server";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { getFallbackProfiles } from "@/services/profiles/fallback-profile.service";

function fallbackAsProfiles(): PedagogicalProfile[] {
  return getFallbackProfiles().map((p, index) => ({
    id: `fallback:${p.slug}`,
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.description,
    system_prompt: p.system_prompt,
    user_prompt: p.user_prompt,
    pedagogical_rules: p.pedagogical_rules,
    adaptation_level: p.adaptation_level,
    options: p.options,
    is_active: p.is_active,
    sort_order: p.sort_order ?? index,
    created_at: "",
    updated_at: "",
  }));
}

export default async function NewPedagogicalProfilePage() {
  const supabase = await createClient();
  let systemProfiles: PedagogicalProfile[] = fallbackAsProfiles();

  try {
    const dbProfiles = await findAllPedagogicalProfiles(supabase);
    if (dbProfiles.length > 0) systemProfiles = dbProfiles;
  } catch {
    // fallback
  }

  return (
    <>
      <AppHeader
        title="Nouveau profil pédagogique"
        description="Créez un profil personnel basé sur un profil système"
      />
      <PageContainer>
        <TeacherProfileEditor systemProfiles={systemProfiles.filter((p) => p.is_active)} />
      </PageContainer>
    </>
  );
}
