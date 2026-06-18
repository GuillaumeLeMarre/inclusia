import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Student } from "@/types";

type Client = SupabaseClient<Database>;

function mapStudent(row: Database["public"]["Tables"]["students"]["Row"]): Student {
  return {
    ...row,
    profiles: Array.isArray(row.profiles) ? (row.profiles as string[]) : [],
  };
}

export async function findStudentsByTeacher(client: Client, teacherId: string) {
  const { data, error } = await client
    .from("students")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapStudent);
}

export async function findStudentById(client: Client, teacherId: string, studentId: string) {
  const { data, error } = await client
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("teacher_id", teacherId)
    .single();

  if (error) throw error;
  return mapStudent(data);
}

export async function findLearningPreferences(client: Client, studentId: string) {
  const { data, error } = await client
    .from("learning_preferences")
    .select("*")
    .eq("student_id", studentId)
    .single();

  if (error) return null;
  return data;
}
