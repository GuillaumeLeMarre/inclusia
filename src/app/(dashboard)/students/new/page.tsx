import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { StudentForm } from "@/features/students/components/student-form";

export default function NewStudentPage() {
  return (
    <>
      <AppHeader
        title="Nouvel élève"
        description="Créez une fiche élève avec profils et préférences"
      />
      <PageContainer>
        <StudentForm />
      </PageContainer>
    </>
  );
}
