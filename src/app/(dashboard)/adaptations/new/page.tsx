import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdaptationWizard } from "@/features/adaptations/components/adaptation-wizard";
import { getDocuments, getProfiles } from "@/services/dashboard.service";
import { findProfilesByTeacher } from "@/repositories/profiles.repository";
import { createClient } from "@/lib/supabase/server";
import { getDemoProfiles } from "@/services/demo/demo-data.service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function NewAdaptationPage() {
  let profiles = getDemoProfiles();
  let documents = await getDocuments();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      profiles = await findProfilesByTeacher(supabase, user.id);
      documents = await getDocuments();
    }
  }

  return (
    <>
      <AppHeader
        title="Nouvelle adaptation"
        description="Sélectionnez un profil, un document et les types d'adaptation à appliquer"
      />
      <PageContainer>
        <AdaptationWizard profiles={profiles} documents={documents} />
      </PageContainer>
    </>
  );
}
