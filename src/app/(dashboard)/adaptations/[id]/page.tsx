import { notFound } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { AdaptationResult } from "@/features/adaptations/components/adaptation-result";
import { findAdaptationById } from "@/repositories/adaptations.repository";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdaptationDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  let adaptation;
  try {
    adaptation = await findAdaptationById(supabase, user.id, id);
  } catch {
    notFound();
  }

  const profileName = adaptation.learnerProfile?.profile_name;

  return (
    <>
      <AppHeader
        title="Support adapté"
        description={adaptation.document?.title ?? "Adaptation générée"}
        action={
          <Link href="/adaptations/new" className="block w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Nouvelle adaptation</Button>
          </Link>
        }
      />
      <PageContainer>
        <AdaptationResult
          adaptation={adaptation}
          profileName={profileName}
          documentTitle={adaptation.document?.title}
        />
      </PageContainer>
    </>
  );
}
