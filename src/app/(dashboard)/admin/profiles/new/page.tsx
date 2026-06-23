import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdminProfileEditor } from "@/features/admin-profiles/components/admin-profile-editor";

export default function AdminNewProfilePage() {
  return (
    <>
      <AppHeader title="Créer un profil système" description="Administration Inclusia" />
      <PageContainer>
        <AdminProfileEditor />
      </PageContainer>
    </>
  );
}
