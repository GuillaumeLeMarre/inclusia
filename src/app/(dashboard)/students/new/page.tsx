import { AppHeader } from "@/components/layout/app-header";
import { StudentForm } from "@/features/students/components/student-form";

export default function NewStudentPage() {
  return (
    <>
      <AppHeader
        title="Nouvel élève"
        description="Créez une fiche élève avec profils et préférences"
      />
      <div className="p-8">
        <StudentForm />
      </div>
    </>
  );
}
