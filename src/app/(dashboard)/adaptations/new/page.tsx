import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { AdaptationWizard } from "@/features/adaptations/components/adaptation-wizard";
import { getDocuments } from "@/services/dashboard.service";
import { findStudentsByTeacher } from "@/repositories/students.repository";
import { createClient } from "@/lib/supabase/server";
import { getDemoStudents } from "@/services/demo/demo-data.service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function NewAdaptationPage() {
  let students = getDemoStudents();
  let documents = await getDocuments();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      students = await findStudentsByTeacher(supabase, user.id);
      documents = await getDocuments();
    }
  }

  return (
    <>
      <AppHeader
        title="Nouvelle adaptation"
        description="Sélectionnez un élève, un document et les profils à appliquer"
      />
      <PageContainer>
        <AdaptationWizard students={students} documents={documents} />
      </PageContainer>
    </>
  );
}
