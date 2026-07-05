import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { TeacherProfileEditor } from "@/features/profiles/components/teacher-profile-editor";
import { createClient } from "@/lib/supabase/server";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { fallbackSeedsAsProfiles } from "@/services/profiles/fallback-profile.service";

export default async function NewPedagogicalProfilePage() {
  const supabase = await createClient();
  let systemProfiles: PedagogicalProfile[] = fallbackSeedsAsProfiles();

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
