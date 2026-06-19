"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MermaidRenderer, MERMAID_ERROR_MESSAGE } from "@/components/mindmaps/MermaidRenderer";
import { useSchemaLoadingElapsed } from "@/features/mindmaps/hooks/use-schema-loading-elapsed";
import type { AdaptationSchemaState } from "@/features/mindmaps/hooks/use-adaptation-schema";
import { useAdaptationSchema } from "@/features/mindmaps/hooks/use-adaptation-schema";
import { getDiagramTypeLabel } from "@/lib/mermaid/diagram-types";
import type { DiagramType } from "@/types/mindmap";

interface SchemaPanelProps {
  adaptationId: string;
  initialMermaid: string | null;
  active?: boolean;
  schemaState?: AdaptationSchemaState;
}

function formatElapsed(seconds: number): string {
  return seconds > 0 ? `${seconds} s` : "quelques secondes";
}

function InitialLoadingCard({ elapsedSeconds }: { elapsedSeconds: number }) {
  return (
    <Card>
      <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 py-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <p className="text-base font-medium text-slate-700 dark:text-slate-200">
          Génération du schéma en cours…
        </p>
        <p className="text-sm text-slate-400">{formatElapsed(elapsedSeconds)}</p>
      </CardContent>
    </Card>
  );
}

export function SchemaPanel({
  adaptationId,
  initialMermaid,
  active = true,
  schemaState: externalSchema,
}: SchemaPanelProps) {
  const internalSchema = useAdaptationSchema(adaptationId, initialMermaid, active && !externalSchema);
  const { result, loading, error, regenerate, retry } = externalSchema ?? internalSchema;
  const elapsedSeconds = useSchemaLoadingElapsed(loading);

  if (!active) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-base text-slate-500">
          Ouvrez cet onglet pour afficher le schéma.
        </CardContent>
      </Card>
    );
  }

  if (loading && !result) {
    return <InitialLoadingCard elapsedSeconds={elapsedSeconds} />;
  }

  if (error && !result) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-base text-red-600">
            {error}
          </p>
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={retry}>
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="space-y-4 py-8">
          <p className="text-center text-base text-slate-500">{MERMAID_ERROR_MESSAGE}</p>
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={retry}>
              <RefreshCw className="h-4 w-4" />
              Générer le schéma
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const typeLabel = getDiagramTypeLabel(result.diagramType as DiagramType);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">{result.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabel}</Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={regenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden />
              )}
              Régénérer
            </Button>
          </div>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Schéma choisi automatiquement : <strong>{result.diagramType}</strong>
        </p>
        <p className="text-base text-slate-500">{result.explanation}</p>
        {loading && (
          <div
            className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Régénération en cours ({formatElapsed(elapsedSeconds)})…
          </div>
        )}
      </CardHeader>
      <CardContent className={loading ? "opacity-60" : undefined}>
        <MermaidRenderer
          code={result.mermaidCode}
          enabled={active}
          suppressLoadingOverlay={loading}
        />
      </CardContent>
    </Card>
  );
}
