import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { falcExportSchema } from "@/schemas/falc.schema";
import { contentDispositionAttachment } from "@/lib/pdf/adaptation-export-filename";
import { ensureAdaptationPdfStored } from "@/services/adaptation/adaptation-pdf-storage.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = falcExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Requête invalide" },
        { status: 400 },
      );
    }

    const payload = await ensureAdaptationPdfStored(
      supabase,
      teacherId,
      parsed.data.adaptationId,
      {
        schemaPng: parsed.data.schemaPng,
        schemaSvg: parsed.data.schemaSvg,
      },
    );

    return new NextResponse(new Uint8Array(payload.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionAttachment(payload.filename),
        "Cache-Control": payload.fromCache ? "private, max-age=3600" : "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
