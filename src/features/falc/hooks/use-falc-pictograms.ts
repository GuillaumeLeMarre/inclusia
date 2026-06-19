"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FalcPictogramsData } from "@/types/falc";

export interface FalcPictogramsState {
  data: FalcPictogramsData | null;
  loading: boolean;
  error: string | null;
  regenerate: () => void;
  retry: () => void;
}

export function useFalcPictograms(
  adaptationId: string,
  initialData: FalcPictogramsData | null,
  enabled: boolean,
): FalcPictogramsState {
  const initialStored = useMemo(() => initialData, [initialData]);
  const [data, setData] = useState<FalcPictogramsData | null>(initialStored);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const initialFetchStartedRef = useRef(false);

  const loadPictograms = useCallback(async (forceRegenerate = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/falc/pictograms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adaptationId, forceRegenerate }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error ?? "Génération des pictogrammes échouée");
      }
      setData(payload as FalcPictogramsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur pictogrammes");
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [adaptationId]);

  useEffect(() => {
    if (!enabled || initialStored?.items?.length || initialFetchStartedRef.current) return;
    initialFetchStartedRef.current = true;
    void loadPictograms(false);
  }, [enabled, initialStored, loadPictograms]);

  useEffect(() => {
    if (initialStored) setData(initialStored);
  }, [initialStored]);

  const regenerate = useCallback(() => {
    void loadPictograms(true);
  }, [loadPictograms]);

  const retry = useCallback(() => {
    setError(null);
    void loadPictograms(false);
  }, [loadPictograms]);

  return { data, loading, error, regenerate, retry };
}
