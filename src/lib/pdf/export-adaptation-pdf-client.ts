import { parseContentDispositionFilename } from "@/lib/pdf/adaptation-export-filename";

interface DownloadAdaptationPdfOptions {
  endpoint?: string;
}

export async function fetchAdaptationPdfBlob(
  adaptationId: string,
  options: DownloadAdaptationPdfOptions = {},
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(options.endpoint ?? `/api/adaptations/${adaptationId}/pdf`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Impossible de charger le PDF");
  }

  const blob = await res.blob();
  const filename =
    parseContentDispositionFilename(res.headers.get("Content-Disposition"))
    ?? "cours-adapte.pdf";

  return { blob, filename };
}

export async function downloadAdaptationPdf(
  adaptationId: string,
  options: DownloadAdaptationPdfOptions = {},
): Promise<void> {
  const res = await fetch(`/api/adaptations/${adaptationId}/pdf?download=1`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Export échoué");
  }

  const blob = await res.blob();
  const filename =
    parseContentDispositionFilename(res.headers.get("Content-Disposition"))
    ?? "cours-adapte.pdf";

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
