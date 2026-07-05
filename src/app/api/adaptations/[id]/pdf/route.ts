import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import {
  contentDispositionAttachment,
  contentDispositionInline,
} from "@/lib/pdf/adaptation-export-filename";
import { ensureAdaptationPdfStored } from "@/services/adaptation/adaptation-pdf-storage.service";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    const download = new URL(request.url).searchParams.get("download") === "1";
    const payload = await ensureAdaptationPdfStored(supabase, teacherId, id);

    return new NextResponse(new Uint8Array(payload.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": download
          ? contentDispositionAttachment(payload.filename)
          : contentDispositionInline(payload.filename),
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
