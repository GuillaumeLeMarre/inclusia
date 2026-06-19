import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { Button } from "@/components/ui/button";
import { ProfileList } from "@/features/profiles/components/profile-list";
import { getProfiles } from "@/services/dashboard.service";

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <>
      <AppHeader
        title="Profils"
        description={`${profiles.length} profil${profiles.length > 1 ? "s" : ""} d'adaptation`}
        action={
          <Link href="/profiles/new" className="block w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nouveau profil
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
