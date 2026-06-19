"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MermaidRenderer, MERMAID_ERROR_MESSAGE } from "@/components/mindmaps/MermaidRenderer";
import { detectDiagramType } from "@/lib/mermaid/mermaid-utils";

interface SchemaPanelProps {
  adaptationId: string;
  initialMermaid: string | null;
  /** true lorsque l'onglet Schéma est actif */
  active?: boolean;
}

interface MindmapApiResponse {
  diagramType: string;
  mermaidCode: string;
}

const DIAGRAM_LABELS: Record<string, string> = {
  mindmap: "Carte mentale",
  timeline: "Frise chronologique",
  "graph TD": "Organigramme",
  diagram: "Schéma",
};

export function SchemaPanel({
  adaptationId,
  initialMermaid,
  active = true,
}: SchemaPanelProps) {
  const [mermaidCode, setMermaidCode] = useState<string | null>(
    initialMermaid?.trim() || null,
  );
  const [diagramType, setDiagramType] = useState<string | null>(
    initialMermaid ? detectDiagramType(initialMermaid) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const loadDiagram = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adaptationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Génération échouée");
      }
      const payload = data as MindmapApiResponse;
      if (!payload.mermaidCode?.trim()) {
        throw new Error(MERMAID_ERROR_MESSAGE);
      }
      setMermaidCode(payload.mermaidCode);
      setDiagramType(payload.diagramType);
    } catch (err) {
      setError(err instanceof Error ? err.message : MERMAID_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [adaptationId]);

  useEffect(() => {
    if (!active) return;

    const hasServerCache = Boolean(initialMermaid?.trim()) && fetchKey === 0;
    if (hasServerCache) return;

    void loadDiagram();
  }, [active, fetchKey, initialMermaid, loadDiagram]);

  const handleRetry = () => {
    setMermaidCode(null);
    setFetchKey((k) => k + 1);
  };

  if (!active) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-base text-slate-500">
          Ouvrez cet onglet pour afficher le schéma.
        </CardContent>
      </Card>
    );
  }

  if (loading && !mermaidCode) {
    return (
      <Card>
        <CardContent className="flex min-h-[240px] items-center justify-center gap-3 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
          <p className="text-base text-slate-500">Génération du schéma pédagogique…</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !mermaidCode) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-base text-red-600">
            {error}
          </p>
          <p className="text-center text-sm text-slate-500">
            Vérifiez que la migration SQL 006 est appliquée sur Supabase.
          </p>
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mermaidCode) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="text-center text-base text-slate-500">{MERMAID_ERROR_MESSAGE}</p>
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4" />
              Générer le schéma
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const typeLabel = DIAGRAM_LABELS[diagramType ?? ""] ?? "Schéma pédagogique";

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-lg">Schéma pédagogique</CardTitle>
        <Badge variant="secondary">{typeLabel}</Badge>
      </CardHeader>
      <CardContent>
        <MermaidRenderer code={mermaidCode} enabled={active} />
      </CardContent>
    </Card>
  );
}
