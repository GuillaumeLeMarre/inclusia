import { Suspense } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdaptationWizard } from "@/features/adaptations/components/adaptation-wizard";
import { getDocuments, getProfiles } from "@/services/dashboard.service";
import { findProfilesByTeacher } from "@/repositories/profiles.repository";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { findTeacherProfiles } from "@/repositories/teacher-profiles.repository";
import { createClient } from "@/lib/supabase/server";
import { getDemoProfiles } from "@/services/demo/demo-data.service";
import type { PedagogicalProfile } from "@/types/pedagogical-profile";
import { getFallbackProfiles } from "@/services/profiles/fallback-profile.service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function fallbackAsProfiles(): PedagogicalProfile[] {
  return getFallbackProfiles().map((p, index) => ({
    id: `fallback:${p.slug}`,
    slug: p.slug,
    name: p.name,
    category: p.category,
    description: p.description,
    system_prompt: p.system_prompt,
    user_prompt: p.user_prompt,
    pedagogical_rules: p.pedagogical_rules,
    adaptation_level: p.adaptation_level,
    options: p.options,
    is_active: p.is_active,
    sort_order: p.sort_order ?? index,
    created_at: "",
    updated_at: "",
  }));
}

export default async function NewAdaptationPage() {
  let profiles = getDemoProfiles();
  let documents = await getDocuments();
  let systemProfiles: PedagogicalProfile[] = fallbackAsProfiles();
  let teacherProfiles: Awaited<ReturnType<typeof findTeacherProfiles>> = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      profiles = await findProfilesByTeacher(supabase, user.id);
      documents = await getDocuments();
      try {
        const dbSystem = await findAllPedagogicalProfiles(supabase);
        if (dbSystem.length > 0) systemProfiles = dbSystem;
        teacherProfiles = await findTeacherProfiles(supabase, user.id);
      } catch {
        // fallback profiles
      }
    }
  }

  return (
    <>
      <AppHeader
        title="Nouvelle adaptation"
        description="Profil apprenant, document et profil pédagogique"
      />
      <PageContainer>
        <Suspense fallback={<p className="text-slate-500">Chargement…</p>}>
          <AdaptationWizard
            profiles={profiles}
            documents={documents}
            systemProfiles={systemProfiles.filter((p) => p.is_active)}
            teacherProfiles={teacherProfiles.filter((p) => p.is_active)}
          />
        </Suspense>
      </PageContainer>
    </>
  );
}
