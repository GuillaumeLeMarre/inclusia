"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAdaptationPdf } from "@/lib/pdf/export-adaptation-pdf-client";
import type { MermaidGenerationResult } from "@/types/mindmap";

interface FalcExportButtonProps {
  adaptationId: string;
  schema?: MermaidGenerationResult | null;
}

export function FalcExportButton({ adaptationId, schema }: FalcExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      await downloadAdaptationPdf(adaptationId, {
        schemaMermaidCode: schema?.mermaidCode,
        schemaTitle: schema?.title,
        endpoint: "/api/falc/export",
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
      className="min-h-[44px]"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Download className="h-4 w-4" aria-hidden />
      )}
      Exporter en PDF FALC
    </Button>
  );
}
