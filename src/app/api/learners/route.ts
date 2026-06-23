import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { findProfilesByTeacher } from "@/repositories/profiles.repository";

/** Profils apprenants anonymes (legacy route → /api/learners). */
export async function GET() {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const profiles = await findProfilesByTeacher(supabase, teacherId);
    return NextResponse.json({ profiles });
  } catch (error) {
    return handleApiError(error);
  }
}
