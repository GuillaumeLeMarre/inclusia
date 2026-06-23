const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;
const DEFAULT_BASENAME = "cours-adapte";

export function sanitizeExportFilenameBase(title: string): string {
  const cleaned = title
    .trim()
    .replace(INVALID_FILENAME_CHARS, "")
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim();

  return cleaned || DEFAULT_BASENAME;
}

export function buildAdaptationExportFilename(
  documentTitle: string | null | undefined,
  options: { falcMode?: boolean } = {},
): string {
  const base = sanitizeExportFilenameBase(documentTitle ?? "");
  const name = options.falcMode ? `${base} - FALC` : base;
  return `${name}.pdf`;
}

export function contentDispositionAttachment(filename: string): string {
  const asciiFallback =
    filename
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "_")
      .trim() || "export.pdf";

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;

  const utf8Match = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // fall through to ASCII filename
    }
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(header);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const plainMatch = /filename=([^;\n]+)/i.exec(header);
  return plainMatch?.[1]?.trim() ?? null;
}
