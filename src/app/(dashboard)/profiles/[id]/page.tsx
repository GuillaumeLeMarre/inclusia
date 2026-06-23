import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { TeacherProfileEditor } from "@/features/profiles/components/teacher-profile-editor";
import { createClient } from "@/lib/supabase/server";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { findTeacherProfileById } from "@/repositories/teacher-profiles.repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeacherProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [profile, systemProfiles] = await Promise.all([
    findTeacherProfileById(supabase, user.id, id),
    findAllPedagogicalProfiles(supabase),
  ]);

  if (!profile) notFound();

  return (
    <>
      <AppHeader title="Modifier le profil" description={profile.name} />
      <PageContainer>
        <TeacherProfileEditor systemProfiles={systemProfiles} initial={profile} />
      </PageContainer>
    </>
  );
}
