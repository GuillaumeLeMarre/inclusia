import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { findTeacherProfiles } from "@/repositories/teacher-profiles.repository";
import { exportTeacherProfiles } from "@/services/profiles/teacher-profile.service";

export async function GET() {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const profiles = await findTeacherProfiles(supabase, teacherId, { includeInactive: true });
    const payload = exportTeacherProfiles(profiles);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="mes-profils-pedagogiques.json"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
