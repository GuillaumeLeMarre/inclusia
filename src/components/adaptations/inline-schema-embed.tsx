"use client";

import { Loader2, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MermaidRenderer } from "@/components/mindmaps/MermaidRenderer";
import { getDiagramTypeLabel } from "@/lib/mermaid/diagram-types";
import type { DiagramType, MermaidGenerationResult } from "@/types/mindmap";
import { cn } from "@/lib/utils";

interface InlineSchemaEmbedProps {
  schema: MermaidGenerationResult;
  caption?: string;
  enabled?: boolean;
  className?: string;
  falcMode?: boolean;
}

export function InlineSchemaEmbed({
  schema,
  caption,
  enabled = true,
  className,
  falcMode = false,
}: InlineSchemaEmbedProps) {
  const typeLabel = getDiagramTypeLabel(schema.diagramType as DiagramType);
  const titleId = `schema-part-${schema.diagramType}`;

  return (
    <figure
      role="region"
      aria-labelledby={titleId}
      className={cn(
        "my-6 rounded-xl border bg-slate-50/80 p-3 dark:bg-slate-900/50",
        falcMode
          ? "border-primary/40 p-4"
          : "border-slate-200 dark:border-slate-700",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="accent" className={cn("gap-1", falcMode && "text-base px-3 py-1")}>
          <Network className="h-4 w-4" aria-hidden />
          Schéma
        </Badge>
        <Badge variant="secondary">{typeLabel}</Badge>
      </div>

      {falcMode && (
        <p className="mb-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Ce schéma t&apos;aide à comprendre le cours.
        </p>
      )}

      <figcaption id={titleId} className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "font-semibold text-slate-900 dark:text-slate-50",
            falcMode ? "text-lg" : "text-base",
          )}
        >
          {caption ?? schema.title}
        </span>
      </figcaption>
      <MermaidRenderer
        code={schema.mermaidCode}
        enabled={enabled}
        className={cn(
          falcMode
            ? "[&>div:last-child]:max-h-[40vh] [&_svg]:max-w-full"
            : "[&>div:last-child]:max-h-[50vh]",
        )}
      />
    </figure>
  );
}

export function InlineSchemaLoading({
  className,
  falcMode = false,
}: {
  className?: string;
  falcMode?: boolean;
}) {
  return (
    <figure
      role="region"
      aria-label="Schéma en cours de chargement"
      className={cn(
        "my-6 flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6",
        falcMode
          ? "border-primary/40 bg-primary/5"
          : "border-slate-200 dark:border-slate-700",
        className,
      )}
      aria-live="polite"
    >
      <Badge variant="accent">Schéma</Badge>
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
        <span className="text-base text-slate-600 dark:text-slate-400">
          Chargement du schéma…
        </span>
      </div>
    </figure>
  );
}
