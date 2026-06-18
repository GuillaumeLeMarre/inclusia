import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  createDocument,
  updateDocumentStatus,
} from "@/repositories/documents.repository";
import {
  extractTextFromBuffer,
  deriveTitle,
  inferFileType,
} from "@/services/documents/extraction.service";
import {
  getExtension,
  MAX_UPLOAD_BYTES,
} from "@/schemas/document.schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const BUCKET = "documents";

export async function uploadDocument(
  client: SupabaseClient<Database>,
  teacherId: string,
  file: File,
) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Fichier trop volumineux (max 20 Mo)");
  }

  const ext = getExtension(file.name);
  if (!ext) {
    throw new Error("Format non supporté. Utilisez PDF, DOCX ou TXT.");
  }

  const fileType = inferFileType(ext);
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${teacherId}/${crypto.randomUUID()}-${file.name}`;

  let extractedText: string | null = null;
  let pageCount: number | null = null;
  let status: "ready" | "error" = "ready";

  try {
    const extracted = await extractTextFromBuffer(buffer, fileType);
    extractedText = extracted.text || null;
    pageCount = extracted.pageCount;
    if (!extractedText) status = "error";
  } catch {
    status = "error";
  }

  if (isSupabaseConfigured()) {
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload échoué : ${uploadError.message}`);
    }
  }

  const document = await createDocument(client, {
    teacherId,
    title: deriveTitle(file.name),
    fileName: file.name,
    fileType,
    fileSize: file.size,
    storagePath,
    extractedText,
    pageCount,
    status,
  });

  if (status === "error" && extractedText === null) {
    await updateDocumentStatus(client, document.id, teacherId, { status: "error" });
  }

  return document;
}
