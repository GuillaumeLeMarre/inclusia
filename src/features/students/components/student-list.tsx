import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { getProfileName } from "@/lib/constants/profiles";
import type { Student } from "@/types";

interface StudentListProps {
  students: Student[];
}

export function StudentList({ students }: StudentListProps) {
  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-slate-500 mb-4">Aucun élève pour le moment.</p>
          <Link href="/students/new">
            <Button>
              <Plus className="h-4 w-4" />
              Créer un élève
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {students.map((student) => (
        <Card key={student.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {getInitials(student.first_name, student.last_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-slate-500">
                  {[student.class_name, student.grade_level].filter(Boolean).join(" · ") || "Classe non renseignée"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {student.profiles.slice(0, 3).map((slug) => (
                    <Badge key={slug} variant="default">
                      {getProfileName(slug)}
                    </Badge>
                  ))}
                  {student.profiles.length > 3 && (
                    <Badge variant="outline">+{student.profiles.length - 3}</Badge>
                  )}
                </div>
              </div>
            </div>
            {student.needs && (
              <p className="mt-4 text-sm text-slate-500 line-clamp-2">{student.needs}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
