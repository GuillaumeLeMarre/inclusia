"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MERMAID_ERROR_MESSAGE } from "@/components/mindmaps/MermaidRenderer";
import { deserializeMindmapResult } from "@/lib/mermaid/parse-mermaid-response";
import type { MermaidGenerationResult } from "@/types/mindmap";

export interface AdaptationSchemaState {
  result: MermaidGenerationResult | null;
  loading: boolean;
  error: string | null;
  loadDiagram: (forceRegenerate?: boolean) => Promise<MermaidGenerationResult | null>;
  regenerate: () => void;
  retry: () => void;
}

export function useAdaptationSchema(
  adaptationId: string,
  initialMermaid: string | null,
  enabled = true,
): AdaptationSchemaState {
  const initialStored = useMemo(
    () => (initialMermaid ? deserializeMindmapResult(initialMermaid) : null),
    [initialMermaid],
  );

  const [result, setResult] = useState<MermaidGenerationResult | null>(initialStored);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef(false);
  const initialFetchStartedRef = useRef(false);

  const loadDiagram = useCallback(async (forceRegenerate = false) => {
    while (inFlightRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adaptationId, forceRegenerate }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Génération échouée");
      }
      const payload = data as MermaidGenerationResult;
      if (!payload.mermaidCode?.trim()) {
        throw new Error(MERMAID_ERROR_MESSAGE);
      }
      setResult(payload);
      return payload;
    } catch (err) {
      setError(err instanceof Error ? err.message : MERMAID_ERROR_MESSAGE);
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [adaptationId]);

  useEffect(() => {
    if (!enabled || initialStored || initialFetchStartedRef.current) return;
    initialFetchStartedRef.current = true;
    void loadDiagram(false);
  }, [enabled, initialStored, loadDiagram]);

  useEffect(() => {
    if (initialStored) {
      setResult(initialStored);
    }
  }, [initialStored]);

  const regenerate = useCallback(() => {
    void loadDiagram(true);
  }, [loadDiagram]);

  const retry = useCallback(() => {
    setError(null);
    void loadDiagram(false);
  }, [loadDiagram]);

  return {
    result,
    loading,
    error,
    loadDiagram,
    regenerate,
    retry,
  };
}
