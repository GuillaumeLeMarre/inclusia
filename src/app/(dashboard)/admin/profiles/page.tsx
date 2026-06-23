import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdminProfilesList } from "@/features/admin-profiles/components/admin-profiles-list";
import { AdminRestorePanel } from "@/features/admin-profiles/components/admin-restore-panel";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/require-admin";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { getSystemProfilesRestoreStatus } from "@/services/profiles/pedagogical-profile.service";

export default async function AdminProfilesPage() {
  const { supabase } = await requireAdmin();
  const [profiles, status] = await Promise.all([
    findAllPedagogicalProfiles(supabase, { includeInactive: true }),
    getSystemProfilesRestoreStatus(supabase),
  ]);

  return (
    <>
      <AppHeader
        title="Administration — profils pédagogiques"
        description={`${profiles.length} profil${profiles.length > 1 ? "s" : ""} système`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/profiles/test">
              <Button variant="outline" className="min-h-[44px]">Tester un prompt</Button>
            </Link>
            <Link href="/admin/profiles/new">
              <Button className="min-h-[44px]">Créer un profil</Button>
            </Link>
          </div>
        }
      />
      <PageContainer className="space-y-8">
        <AdminRestorePanel initialStatus={status} />
        <AdminProfilesList profiles={profiles} />
      </PageContainer>
    </>
  );
}
