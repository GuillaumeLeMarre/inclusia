import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { Button } from "@/components/ui/button";
import { ProfileList } from "@/features/profiles/components/profile-list";
import { getProfiles } from "@/services/dashboard.service";

export default async function LearnersPage() {
  const profiles = await getProfiles();

  return (
    <>
      <AppHeader
        title="Apprenants"
        description={`${profiles.length} profil${profiles.length > 1 ? "s" : ""} apprenant anonyme${profiles.length > 1 ? "s" : ""}`}
        action={
          <Link href="/learners/new" className="block w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nouveau profil apprenant
            </Button>
          </Link>
        }
      />
      <PageContainer className="space-y-4">
        <PrivacyNotice />
        <ProfileList profiles={profiles} />
      </PageContainer>
    </>
  );
}
