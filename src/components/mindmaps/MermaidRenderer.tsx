"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fixTimelineAxisPosition, isTimelineDiagram } from "@/lib/mermaid/fix-timeline-layout";
import { getMermaidInitializeOptions, getMermaidTheme } from "@/lib/mermaid/mermaid-init-config";
import { centerMindmapRootNodeLabels } from "@/lib/mermaid/center-mindmap-root-label";
import { normalizeMindmapRootLabel } from "@/lib/mermaid/normalize-mindmap-root-label";

interface MermaidRendererProps {
  code: string;
  className?: string;
  /** Ne rendre que lorsque le conteneur est visible (onglet actif). */
  enabled?: boolean;
  /** Masque le spinner interne (ex. régénération gérée par le parent). */
  suppressLoadingOverlay?: boolean;
  /** Titre affiché au centre d'une mindmap (remplace « root »). */
  rootLabel?: string | null;
}

const ERROR_MESSAGE = "Impossible de générer le schéma.";

export function MermaidRenderer({
  code,
  className,
  enabled = true,
  suppressLoadingOverlay = false,
  rootLabel,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCounter = useRef(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [zoom, setZoom] = useState(1);

  const renderDiagram = useCallback(async () => {
    if (!enabled || !containerRef.current || !code.trim()) {
      setStatus("idle");
      return;
    }

    const diagramCode = normalizeMindmapRootLabel(code, rootLabel);

    setStatus("loading");
    renderCounter.current += 1;
    const renderId = `inclusia-mmd-${renderCounter.current}`;

    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize(getMermaidInitializeOptions(getMermaidTheme()));

      const { svg } = await mermaid.render(renderId, diagramCode);

      if (!containerRef.current) return;

      containerRef.current.innerHTML = svg;
      const svgEl = containerRef.current.querySelector("svg");
      if (svgEl) {
        if (isTimelineDiagram(diagramCode)) {
          fixTimelineAxisPosition(svgEl);
        }
        centerMindmapRootNodeLabels(svgEl);
        svgEl.removeAttribute("height");
        svgEl.style.width = "100%";
        svgEl.style.maxWidth = "100%";
        svgEl.style.height = "auto";
        svgEl.style.display = "block";
      }
      setStatus("ready");
    } catch (err) {
      console.error("[MermaidRenderer]", err);
      setStatus("error");
    }
  }, [code, enabled, rootLabel]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    const frame = requestAnimationFrame(() => {
      void renderDiagram();
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, renderDiagram]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (enabled) void renderDiagram();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [enabled, renderDiagram]);

  const adjustZoom = (delta: number) => {
    setZoom((z) => Math.min(2.5, Math.max(0.5, +(z + delta).toFixed(1))));
  };

  if (!enabled) {
    return null;
  }

  if (status === "error") {
    return (
      <p
        data-testid="mermaid-error"
        className="rounded-lg bg-slate-100 px-4 py-6 text-center text-base text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      >
        {ERROR_MESSAGE}
      </p>
    );
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          aria-label="Zoom arrière"
          onClick={() => adjustZoom(-0.1)}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          aria-label="Zoom avant"
          onClick={() => adjustZoom(0.1)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="relative w-full overflow-auto rounded-xl border border-slate-200 bg-white p-4 touch-pan-x touch-pan-y dark:bg-slate-900 dark:border-slate-700"
        style={{ maxHeight: "70vh", minHeight: "220px" }}
      >
        {status === "loading" && !suppressLoadingOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <span className="sr-only">Chargement du schéma…</span>
          </div>
        )}
        <div
          ref={containerRef}
          data-testid="mermaid-diagram"
          className="w-full min-w-0 min-h-[180px] origin-top-left transition-transform"
          style={{ transform: `scale(${zoom})` }}
          aria-live="polite"
        />
      </div>
    </div>
  );
}

export { ERROR_MESSAGE as MERMAID_ERROR_MESSAGE };
