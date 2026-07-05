import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PedagogicalProfilesView } from "@/features/profiles/components/pedagogical-profiles-view";
import { createClient } from "@/lib/supabase/server";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { findTeacherProfiles } from "@/repositories/teacher-profiles.repository";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { fallbackSeedsAsProfiles } from "@/services/profiles/fallback-profile.service";

export default async function PedagogicalProfilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let systemProfiles: PedagogicalProfile[] = fallbackSeedsAsProfiles();

  let myProfiles: Awaited<ReturnType<typeof findTeacherProfiles>> = [];

  if (user) {
    try {
      const dbProfiles = await findAllPedagogicalProfiles(supabase);
      if (dbProfiles.length > 0) systemProfiles = dbProfiles;
      myProfiles = await findTeacherProfiles(supabase, user.id, { includeInactive: true });
    } catch {
      // fallback déjà chargé
    }
  }

  return (
    <>
      <AppHeader
        title="Profils pédagogiques"
        description="Profils système et profils personnalisés pour vos adaptations"
        action={
          <Link href="/profiles/new" className="block w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nouveau profil
            </Button>
          </Link>
        }
      />
      <PageContainer>
        <PedagogicalProfilesView
          systemProfiles={systemProfiles.filter((p) => p.is_active)}
          myProfiles={myProfiles}
        />
      </PageContainer>
    </>
  );
}
