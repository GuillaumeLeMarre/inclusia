"use client";

import { MermaidRenderer } from "@/components/mindmaps/MermaidRenderer";

interface SchemaExportRendererProps {
  mermaidCode?: string | null;
  rootLabel?: string | null;
}

/** Pré-rend le schéma hors écran pour l'export PDF (capture DOM). */
export function SchemaExportRenderer({ mermaidCode, rootLabel }: SchemaExportRendererProps) {
  if (!mermaidCode?.trim()) return null;

  return (
    <div
      aria-hidden="true"
      data-export-schema-root
      className="pointer-events-none fixed left-0 top-0 -z-50 h-[800px] w-[1200px] overflow-hidden opacity-0"
    >
      <MermaidRenderer
        code={mermaidCode}
        rootLabel={rootLabel}
        enabled
        suppressLoadingOverlay
      />
    </div>
  );
}
