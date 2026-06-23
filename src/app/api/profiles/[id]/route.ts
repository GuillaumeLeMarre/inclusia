import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { findTeacherProfileById, deleteTeacherProfile } from "@/repositories/teacher-profiles.repository";
import { updateTeacherProfile } from "@/services/profiles/teacher-profile.service";
import { teacherProfilePatchSchema } from "@/schemas/pedagogical-profile.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    const profile = await findTeacherProfileById(supabase, teacherId, id);
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    const body = await request.json();
    const parsed = teacherProfilePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await updateTeacherProfile(supabase, teacherId, id, parsed.data);
    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    await deleteTeacherProfile(supabase, teacherId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
