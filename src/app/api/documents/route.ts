import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { findDocumentsByTeacher } from "@/repositories/documents.repository";
import { uploadDocument } from "@/services/documents/upload.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const documents = await findDocumentsByTeacher(supabase, teacherId);
    return NextResponse.json({ documents });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    const document = await uploadDocument(supabase, teacherId, file);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
