import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { adaptRequestSchema } from "@/schemas/adapt.schema";
import { runAdaptationEngine } from "@/services/adaptation/adaptation.engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = adaptRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Requête invalide" },
        { status: 400 },
      );
    }

    const adaptation = await runAdaptationEngine(supabase, {
      teacherId,
      studentId: parsed.data.studentId,
      documentId: parsed.data.documentId,
      profileSlugs: parsed.data.profileSlugs,
    });

    return NextResponse.json({ adaptation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
