import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import {
  deleteTeacherDocument,
  getAdaptationCountForDocument,
  getDocumentForTeacher,
} from "@/services/documents/document.service";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    const document = await getDocumentForTeacher(supabase, teacherId, id);

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    const adaptationsCount = await getAdaptationCountForDocument(supabase, teacherId, id);
    return NextResponse.json({ document, adaptationsCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    await deleteTeacherDocument(supabase, teacherId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
