import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { profileImportSchema } from "@/schemas/pedagogical-profile.schema";
import { createTeacherProfile } from "@/services/profiles/teacher-profile.service";
import { findPedagogicalProfileBySlug } from "@/repositories/pedagogical-profiles.repository";

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = profileImportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const imported = [];
    for (const item of parsed.data.profiles) {
      let sourceProfileId = item.source_profile_id ?? null;
      if (!sourceProfileId && "source_slug" in item && typeof item.source_slug === "string") {
        const system = await findPedagogicalProfileBySlug(supabase, item.source_slug);
        sourceProfileId = system?.id ?? null;
      }

      const { source_slug: _slug, ...profileInput } = item as typeof item & { source_slug?: string };
      const profile = await createTeacherProfile(supabase, teacherId, {
        ...profileInput,
        source_profile_id: sourceProfileId,
      });
      imported.push(profile);
    }

    return NextResponse.json({ imported, count: imported.length }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
