"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAdaptationPdf } from "@/lib/pdf/export-adaptation-pdf-client";

interface AdaptationExportButtonProps {
  adaptationId: string;
  className?: string;
}

export function AdaptationExportButton({
  adaptationId,
  className,
}: AdaptationExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      await downloadAdaptationPdf(adaptationId);
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
        : "Télécharger le PDF"}
    </Button>
  );
}
