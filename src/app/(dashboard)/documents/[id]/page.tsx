import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { DocumentDetail } from "@/features/documents/components/document-detail";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getAdaptationCountForDocument,
  getDocumentForTeacher,
} from "@/services/documents/document.service";
import { getDemoDocumentById } from "@/services/demo/demo-data.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    const document = getDemoDocumentById(id);
    if (!document) notFound();

    return (
      <>
        <AppHeader title="Document" description={document.title} />
        <PageContainer>
          <DocumentDetail document={document} adaptationsCount={0} />
        </PageContainer>
      </>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const document = await getDocumentForTeacher(supabase, user.id, id);
  if (!document) notFound();

  const adaptationsCount = await getAdaptationCountForDocument(supabase, user.id, id);

  return (
    <>
      <AppHeader title="Document" description={document.title} />
      <PageContainer>
        <DocumentDetail document={document} adaptationsCount={adaptationsCount} />
      </PageContainer>
    </>
  );
}
