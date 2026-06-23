import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { adaptationExportSchema } from "@/schemas/adaptation-export.schema";
import { resolveExportSchema } from "@/lib/pdf/resolve-export-schema";
import { findAdaptationById } from "@/repositories/adaptations.repository";
import { buildAdaptationPdfBuffer } from "@/services/adaptation/adaptation-pdf.service";
import { getOrCreateMindmap } from "@/services/mindmap/mindmap.service";
import {
  buildAdaptationExportFilename,
  contentDispositionAttachment,
} from "@/lib/pdf/adaptation-export-filename";

export const runtime = "nodejs";
export const maxDuration = 60;

function getExportContent(
  adaptation: Awaited<ReturnType<typeof findAdaptationById>>,
): string {
  if (adaptation.adaptation_level === "falc" && adaptation.falc_content?.trim()) {
    return adaptation.falc_content;
  }
  return adaptation.adapted_content?.trim() ?? "";
}

async function resolveSchemaForExport(
  supabase: Awaited<ReturnType<typeof requireTeacher>>["supabase"],
  teacherId: string,
  adaptation: Awaited<ReturnType<typeof findAdaptationById>>,
) {
  const cached = resolveExportSchema(adaptation);
  if (cached?.mermaidCode) return cached;

  try {
    return await getOrCreateMindmap(supabase, teacherId, adaptation.id);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, teacherId } = await requireTeacher();
    const body = await request.json();
    const parsed = adaptationExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Requête invalide" },
        { status: 400 },
      );
    }

    const adaptation = await findAdaptationById(
      supabase,
      teacherId,
      parsed.data.adaptationId,
    );

    const content = getExportContent(adaptation);
    if (!content) {
      return NextResponse.json(
        { error: "Aucun contenu adapté à exporter." },
        { status: 400 },
      );
    }

    const isFalc = adaptation.adaptation_level === "falc";
    const title = adaptation.document?.title ?? "Cours adapté";
    const schema = await resolveSchemaForExport(supabase, teacherId, adaptation);
    const pdf = await buildAdaptationPdfBuffer(title, content, {
      falcMode: isFalc,
      schema,
      schemaPng: parsed.data.schemaPng,
      schemaSvg: parsed.data.schemaSvg,
    });
    const filename = buildAdaptationExportFilename(adaptation.document?.title, {
      falcMode: isFalc,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionAttachment(filename),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
