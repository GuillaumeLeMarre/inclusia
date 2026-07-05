import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { createDocumentFileSignedUrl } from "@/services/documents/document.service";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const { id } = await params;
    const file = await createDocumentFileSignedUrl(supabase, teacherId, id);
    return NextResponse.redirect(file.url);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
