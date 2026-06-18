import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getDemoActivity,
  getDemoDocuments,
  getDemoStats,
  getDemoStudents,
} from "@/services/demo/demo-data.service";
import type { DashboardStats, Document, RecentActivity, Student } from "@/types";

import type { Tables } from "@/types/database";

type AdaptationActivityRow = {
  id: string;
  created_at: string;
  students: { first_name: string; last_name: string } | null;
  documents: { title: string } | null;
};

function mapStudentRow(row: Tables<"students">): Student {
  return {
    ...row,
    profiles: Array.isArray(row.profiles) ? (row.profiles as string[]) : [],
  };
}

function mapDocumentRow(row: Tables<"documents">): Document {
  return {
    ...row,
    metadata: (row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata))
      ? (row.metadata as Record<string, unknown>)
      : {},
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) return getDemoStats();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getDemoStats();

  const [students, documents, adaptations] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("adaptations").select("id", { count: "exact", head: true }),
  ]);

  const adaptationsCount = adaptations.count ?? 0;

  return {
    studentsCount: students.count ?? 0,
    adaptationsCount,
    documentsCount: documents.count ?? 0,
    estimatedTimeSavedMinutes: adaptationsCount * 20,
  };
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  if (!isSupabaseConfigured()) return getDemoActivity();

  const supabase = await createClient();
  const { data: adaptations } = await supabase
    .from("adaptations")
    .select("id, created_at, students(first_name, last_name), documents(title)")
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<AdaptationActivityRow[]>();

  if (!adaptations?.length) return getDemoActivity();

  return adaptations.map((a) => {
    const student = a.students;
    const doc = a.documents;
    return {
      id: a.id,
      type: "adaptation" as const,
      title: `Adaptation pour ${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim(),
      description: doc?.title ?? "Document",
      created_at: a.created_at,
    };
  });
}

export async function getStudents(): Promise<Student[]> {
  if (!isSupabaseConfigured()) return getDemoStudents();

  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return getDemoStudents();
  return data.map(mapStudentRow);
}

export async function getDocuments(): Promise<Document[]> {
  if (!isSupabaseConfigured()) return getDemoDocuments();

  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return getDemoDocuments();
  return data.map(mapDocumentRow);
}
