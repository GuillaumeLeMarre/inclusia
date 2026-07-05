"use client";

import { useEffect, useState } from "react";
import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdaptationPdfViewerProps {
  adaptationId: string;
}

export function AdaptationPdfViewer({ adaptationId }: AdaptationPdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    setPdfUrl(null);

    const pdfEndpoint = `/api/adaptations/${adaptationId}/pdf`;
    setPdfUrl(`${pdfEndpoint}?v=${reloadKey}`);

    let cancelled = false;
    fetch(pdfEndpoint)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error ?? "Impossible de charger le PDF");
          });
        }
      })
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setPdfUrl(null);
          setError(err instanceof Error ? err.message : "Impossible de charger le PDF");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [adaptationId, reloadKey]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          <p className="text-base font-medium">Chargement du PDF…</p>
          <p className="text-base text-slate-500">
            Le support adapté est stocké au format PDF.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" aria-hidden />
          <p className="text-base text-red-600">{error}</p>
          <Button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="w-full sm:w-auto"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!pdfUrl) return null;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-base text-slate-600">
          <FileText className="h-5 w-5 shrink-0" aria-hidden />
          <span>Aperçu PDF du support adapté</span>
        </div>
        <iframe
          src={pdfUrl}
          title="Support adapté au format PDF"
          className="h-[75vh] min-h-[420px] w-full rounded-b-xl bg-slate-100"
        />
      </CardContent>
    </Card>
  );
}
