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
        <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
          <p className="text-base text-slate-500 mb-4">Aucun élève pour le moment.</p>
          <Link href="/students/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Créer un élève
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile: cards empilées */}
      <div className="space-y-3 md:hidden">
        {students.map((student) => (
          <StudentMobileCard key={student.id} student={student} />
        ))}
      </div>

      {/* Desktop: tableau */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-base">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-foreground">Nom</th>
              <th className="px-4 py-3 font-semibold text-foreground">Classe</th>
              <th className="px-4 py-3 font-semibold text-foreground">Profils</th>
              <th className="px-4 py-3 font-semibold text-foreground">Besoins</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(student.first_name, student.last_name)}
                    </div>
                    <span className="font-medium">{student.first_name} {student.last_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {[student.class_name, student.grade_level].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {student.profiles.slice(0, 3).map((slug) => (
                      <Badge key={slug} variant="default">{getProfileName(slug)}</Badge>
                    ))}
                    {student.profiles.length > 3 && (
                      <Badge variant="outline">+{student.profiles.length - 3}</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                  {student.needs ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StudentMobileCard({ student }: { student: Student }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {getInitials(student.first_name, student.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-base">
              {student.first_name} {student.last_name}
            </p>
            <p className="text-base text-slate-500">
              {[student.class_name, student.grade_level].filter(Boolean).join(" · ") || "Classe non renseignée"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Profils</p>
          <div className="flex flex-wrap gap-1.5">
            {student.profiles.map((slug) => (
              <Badge key={slug} variant="default">{getProfileName(slug)}</Badge>
            ))}
          </div>
        </div>
        {student.needs && (
          <p className="text-base text-slate-600 line-clamp-3">{student.needs}</p>
        )}
      </CardContent>
    </Card>
  );
}
