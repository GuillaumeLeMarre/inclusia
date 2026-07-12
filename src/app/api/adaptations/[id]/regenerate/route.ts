import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { extractErrorMessage } from "@/lib/api/extract-error-message";
import { regenerateTeacherAdaptation } from "@/services/adaptation/adaptation-regenerate.service";

export const runtime = "nodejs";
export const maxDuration = 300;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    const adaptation = await regenerateTeacherAdaptation(supabase, teacherId, id);
    return NextResponse.json({ adaptation });
  } catch (error) {
    console.error("[adaptation-regenerate]", error);
    const message = extractErrorMessage(error);
    if (message === "Erreur inconnue") {
      return handleApiError(error);
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
