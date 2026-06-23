import { requireTeacher, ApiError } from "@/lib/auth/require-teacher";
import type { UserRole } from "@/types";

export async function requireAdmin() {
  const ctx = await requireTeacher();
  const { data: teacher, error } = await ctx.supabase
    .from("teachers")
    .select("role")
    .eq("id", ctx.teacherId)
    .single();

  if (error || !teacher) {
    throw new ApiError("Profil enseignant introuvable", 403);
  }

  if (teacher.role !== "admin") {
    throw new ApiError("Accès réservé aux administrateurs", 403);
  }

  return ctx;
}

export async function getTeacherRole(teacherId: string): Promise<UserRole | null> {
  const { supabase } = await requireTeacher();
  const { data } = await supabase
    .from("teachers")
    .select("role")
    .eq("id", teacherId)
    .maybeSingle();
  return (data?.role as UserRole) ?? null;
}
