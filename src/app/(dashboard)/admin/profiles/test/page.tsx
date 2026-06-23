import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdminProfileTestPanel } from "@/features/admin-profiles/components/admin-profile-test-panel";
import { requireAdmin } from "@/lib/auth/require-admin";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";

export default async function AdminProfileTestPage() {
  const { supabase } = await requireAdmin();
  const profiles = await findAllPedagogicalProfiles(supabase, { includeInactive: true });

  return (
    <>
      <AppHeader
        title="Test de prompt"
        description="Exécute l'IA sans enregistrer de résultat"
      />
      <PageContainer>
        <AdminProfileTestPanel profiles={profiles} />
      </PageContainer>
    </>
  );
}
