"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createAdaptationMarkdownComponents } from "@/components/adaptations/adaptation-markdown-components";
import {
  InlineSchemaEmbed,
  InlineSchemaLoading,
} from "@/components/adaptations/inline-schema-embed";
import { cleanAdaptationContent } from "@/lib/adaptations/clean-adaptation-content";
import { contentHasMarkdownImage } from "@/lib/adaptations/markdown-html-utils";
import { getAdaptationContainerClasses } from "@/lib/adaptations/reading-mode-styles";
import type { ReadingMode } from "@/types/reading-mode";
import type { MermaidGenerationResult } from "@/types/mindmap";
import { cn } from "@/lib/utils";

interface AdaptationMarkdownViewProps {
  content: string;
  mode: ReadingMode;
  onOpenSchema?: () => void;
  className?: string;
  embeddedSchema?: MermaidGenerationResult | null;
  schemaLoading?: boolean;
  appendSchemaIfMissing?: boolean;
  schemaEnabled?: boolean;
}

/** Rendu Markdown pédagogique (sans dépendance au mode lecture stocké). */
export function AdaptationMarkdownView({
  content,
  mode,
  onOpenSchema,
  className,
  embeddedSchema,
  schemaLoading = false,
  appendSchemaIfMissing = false,
  schemaEnabled = true,
}: AdaptationMarkdownViewProps) {
  const cleaned = useMemo(() => cleanAdaptationContent(content), [content]);
  const components = useMemo(
    () =>
      createAdaptationMarkdownComponents({
        mode,
        onOpenSchema,
        embeddedSchema,
        schemaLoading,
        schemaEnabled,
      }),
    [mode, onOpenSchema, embeddedSchema, schemaLoading, schemaEnabled],
  );

  const falcMode = mode === "falc";

  const showAppendedSchema =
    appendSchemaIfMissing
    && !contentHasMarkdownImage(cleaned)
    && (embeddedSchema?.mermaidCode || schemaLoading);

  if (!cleaned && !showAppendedSchema) return null;

  return (
    <article
      className={cn(getAdaptationContainerClasses(mode), className)}
      aria-label="Contenu pédagogique adapté"
    >
      {cleaned && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {cleaned}
        </ReactMarkdown>
      )}
      {showAppendedSchema && embeddedSchema?.mermaidCode && (
        <InlineSchemaEmbed schema={embeddedSchema} enabled={schemaEnabled} falcMode={falcMode} />
      )}
      {showAppendedSchema && schemaLoading && !embeddedSchema?.mermaidCode && (
        <InlineSchemaLoading falcMode={falcMode} />
      )}
    </article>
  );
}
