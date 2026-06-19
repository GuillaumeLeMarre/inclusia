import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { falcRequestSchema } from "@/schemas/falc.schema";
import { getOrGenerateFalc } from "@/services/falc/falc.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = falcRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Requête invalide" },
        { status: 400 },
      );
    }

    const result = await getOrGenerateFalc(
      supabase,
      teacherId,
      parsed.data.adaptationId,
      parsed.data.forceRegenerate ?? false,
    );

    return NextResponse.json({
      content: result.content,
      score: result.score,
      label: result.label,
      metrics: result.metrics,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
