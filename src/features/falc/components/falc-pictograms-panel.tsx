"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FalcPictogramCard } from "@/features/falc/components/falc-pictogram-card";
import {
  useFalcPictograms,
  type FalcPictogramsState,
} from "@/features/falc/hooks/use-falc-pictograms";
import type { FalcPictogramsData } from "@/types/falc";

interface FalcPictogramsPanelProps {
  adaptationId?: string;
  initialData?: FalcPictogramsData | null;
  enabled: boolean;
  compact?: boolean;
  state?: FalcPictogramsState;
}

export function FalcPictogramsPanel({
  adaptationId = "",
  initialData = null,
  enabled,
  compact = false,
  state,
}: FalcPictogramsPanelProps) {
  const internalState = useFalcPictograms(
    adaptationId,
    initialData,
    enabled && !state,
  );
  const { data, loading, error, regenerate, retry } = state ?? internalState;

  if (!enabled) return null;

  const items = data?.items ?? [];

  if (compact && !loading && !error && items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-lg">Pictogrammes</CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Illustrations ARASAAC intégrées dans le cours (mots en gras) et récapitulées ici.
        </p>

        {loading && items.length === 0 && (
          <div className="flex min-h-[120px] items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Recherche des pictogrammes…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-base text-red-700 dark:text-red-300">{error}</p>
            <Button type="button" variant="outline" className="mt-3 min-h-[44px]" onClick={retry}>
              Réessayer
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <FalcPictogramCard key={`${item.id}-${item.keyword}`} item={item} />
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-base text-slate-500">
            Aucun pictogramme disponible pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
