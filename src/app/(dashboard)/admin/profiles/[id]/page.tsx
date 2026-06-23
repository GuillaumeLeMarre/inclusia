import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdminProfileEditor } from "@/features/admin-profiles/components/admin-profile-editor";
import { requireAdmin } from "@/lib/auth/require-admin";
import { findPedagogicalProfileById } from "@/repositories/pedagogical-profiles.repository";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const profile = await findPedagogicalProfileById(supabase, id);
  if (!profile) notFound();

  return (
    <>
      <AppHeader title="Modifier le profil système" description={profile.name} />
      <PageContainer>
        <AdminProfileEditor initial={profile} />
      </PageContainer>
    </>
  );
}
