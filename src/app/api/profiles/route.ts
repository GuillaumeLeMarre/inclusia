import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { findAllPedagogicalProfiles } from "@/repositories/pedagogical-profiles.repository";
import { findTeacherProfiles } from "@/repositories/teacher-profiles.repository";
import { createTeacherProfile } from "@/services/profiles/teacher-profile.service";
import { teacherProfileInputSchema } from "@/schemas/pedagogical-profile.schema";

export async function GET() {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const [systemProfiles, myProfiles] = await Promise.all([
      findAllPedagogicalProfiles(supabase),
      findTeacherProfiles(supabase, teacherId, { includeInactive: true }),
    ]);
    return NextResponse.json({ systemProfiles, myProfiles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = teacherProfileInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await createTeacherProfile(supabase, teacherId, parsed.data);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
