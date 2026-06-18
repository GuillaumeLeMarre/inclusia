import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { findStudentsByTeacher } from "@/repositories/students.repository";

export async function GET() {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const students = await findStudentsByTeacher(supabase, teacherId);
    return NextResponse.json({ students });
  } catch (error) {
    return handleApiError(error);
  }
}
