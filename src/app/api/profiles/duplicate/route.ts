import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { duplicateTeacherProfileSchema } from "@/schemas/pedagogical-profile.schema";
import {
  duplicateSystemProfileForTeacher,
  duplicateTeacherProfile,
} from "@/services/profiles/teacher-profile.service";

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = duplicateTeacherProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = parsed.data.source_profile_id
      ? await duplicateSystemProfileForTeacher(
          supabase,
          teacherId,
          parsed.data.source_profile_id,
          parsed.data.name,
        )
      : await duplicateTeacherProfile(
          supabase,
          teacherId,
          parsed.data.teacher_profile_id!,
          parsed.data.name,
        );

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
