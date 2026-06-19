import { NextResponse } from "next/server";
import { handleApiError, requireTeacher } from "@/lib/auth/require-teacher";
import { resolveExportSchema } from "@/lib/pdf/resolve-export-schema";
import { falcExportSchema } from "@/schemas/falc.schema";
import { findAdaptationById } from "@/repositories/adaptations.repository";
import { buildAdaptationPdfBuffer } from "@/services/adaptation/adaptation-pdf.service";
import { getOrCreateMindmap } from "@/services/mindmap/mindmap.service";

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

    const adaptation = await findAdaptationById(
      supabase,
      teacherId,
      parsed.data.adaptationId,
    );

    const content =
      adaptation.falc_content?.trim()
      || adaptation.adapted_content?.trim()
      || "";

    if (!content) {
      return NextResponse.json({ error: "Aucun contenu FALC à exporter." }, { status: 400 });
    }

    const title = adaptation.document?.title ?? "Support FALC";
    let schema = resolveExportSchema(adaptation);
    if (!schema?.mermaidCode) {
      try {
        schema = await getOrCreateMindmap(supabase, teacherId, adaptation.id);
      } catch {
        schema = null;
      }
    }

    const pdf = await buildAdaptationPdfBuffer(title, content, {
      falcMode: true,
      schema,
      schemaPng: parsed.data.schemaPng,
      schemaSvg: parsed.data.schemaSvg,
    });
    const filename = `falc-${adaptation.id.slice(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
