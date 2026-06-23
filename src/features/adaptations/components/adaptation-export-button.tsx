"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAdaptationPdf } from "@/lib/pdf/export-adaptation-pdf-client";
import type { AdaptationLevel } from "@/types/adaptation-level";
import type { MermaidGenerationResult } from "@/types/mindmap";

interface AdaptationExportButtonProps {
  adaptationId: string;
  adaptationLevel?: AdaptationLevel;
  schema?: MermaidGenerationResult | null;
  ensureSchemaLoaded?: () => Promise<string | null>;
  className?: string;
}

export function AdaptationExportButton({
  adaptationId,
  adaptationLevel = "standard",
  schema,
  ensureSchemaLoaded,
  className,
}: AdaptationExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const isFalc = adaptationLevel === "falc";

  async function handleExport() {
    setLoading(true);
    try {
      let mermaidCode = schema?.mermaidCode?.trim() || null;
      if (!mermaidCode && ensureSchemaLoaded) {
        mermaidCode = await ensureSchemaLoaded();
      }

      await downloadAdaptationPdf(adaptationId, {
        schemaMermaidCode: mermaidCode,
      });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Export PDF impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? "min-h-[44px]"}
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Download className="h-4 w-4" aria-hidden />
      )}
      {loading
        ? "Préparation du PDF…"
        : isFalc
          ? "Exporter en PDF FALC"
          : "Exporter le cours en PDF"}
    </Button>
  );
}
