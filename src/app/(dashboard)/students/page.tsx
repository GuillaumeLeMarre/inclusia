import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { StudentList } from "@/features/students/components/student-list";
import { getStudents } from "@/services/dashboard.service";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <>
      <AppHeader
        title="Élèves"
        description={`${students.length} élève${students.length > 1 ? "s" : ""} enregistré${students.length > 1 ? "s" : ""}`}
        action={
          <Link href="/students/new">
            <Button>
              <Plus className="h-4 w-4" />
              Nouvel élève
            </Button>
          </Link>
        }
      />
      <div className="p-8">
        <StudentList students={students} />
      </div>
    </>
  );
}
