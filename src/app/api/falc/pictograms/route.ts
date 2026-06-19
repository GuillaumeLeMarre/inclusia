import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { falcPictogramsRequestSchema } from "@/schemas/falc.schema";
import { getOrGenerateFalcPictograms } from "@/services/falc/falc-pictogram-orchestrator.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = falcPictogramsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Requête invalide" },
        { status: 400 },
      );
    }

    const result = await getOrGenerateFalcPictograms(
      supabase,
      teacherId,
      parsed.data.adaptationId,
      parsed.data.forceRegenerate ?? false,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
