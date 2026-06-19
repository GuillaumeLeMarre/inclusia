import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { ProfileForm } from "@/features/profiles/components/profile-form";

export default function NewProfilePage() {
  return (
    <>
      <AppHeader
        title="Nouveau profil"
        description="Créez un profil d'adaptation anonyme pour personnaliser vos supports"
      />
      <PageContainer>
        <ProfileForm />
      </PageContainer>
    </>
  );
}
