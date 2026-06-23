import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { LearnerProfileForm } from "@/features/learners/components/learner-profile-form";
import { createClient } from "@/lib/supabase/server";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { getFallbackProfiles } from "@/services/profiles/fallback-profile.service";

export default async function NewLearnerPage() {
  const supabase = await createClient();
  let slugs: { slug: string; name: string }[];

  try {
    const profiles = await findAllPedagogicalProfiles(supabase);
    slugs = profiles.map((p) => ({ slug: p.slug, name: p.name }));
  } catch {
    slugs = getFallbackProfiles().map((p) => ({ slug: p.slug, name: p.name }));
  }

  return (
    <>
      <AppHeader
        title="Nouveau profil apprenant"
        description="Créez un profil d'adaptation anonyme pour contextualiser vos supports"
      />
      <PageContainer>
        <LearnerProfileForm pedagogicalSlugs={slugs} />
      </PageContainer>
    </>
  );
}
