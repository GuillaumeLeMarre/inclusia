"use client";

import { AdaptationMarkdownView } from "@/components/adaptations/AdaptationMarkdownView";
import { useReadingMode } from "@/hooks/use-reading-mode";
import type { ReadingMode } from "@/types/reading-mode";
import type { FalcPictogramItem } from "@/types/falc";
import type { MermaidGenerationResult } from "@/types/mindmap";

interface AdaptationRendererProps {
  content: string;
  mode?: ReadingMode;
  onOpenSchema?: () => void;
  className?: string;
  embeddedSchema?: MermaidGenerationResult | null;
  schemaLoading?: boolean;
  appendSchemaIfMissing?: boolean;
  schemaEnabled?: boolean;
  inlinePictograms?: FalcPictogramItem[] | null;
}

export function AdaptationRenderer({
  content,
  mode: modeOverride,
  onOpenSchema,
  className,
  embeddedSchema,
  schemaLoading,
  appendSchemaIfMissing,
  schemaEnabled,
  inlinePictograms,
}: AdaptationRendererProps) {
  const { mode: storedMode } = useReadingMode();

  return (
    <AdaptationMarkdownView
      content={content}
      mode={modeOverride ?? storedMode}
      onOpenSchema={onOpenSchema}
      className={className}
      embeddedSchema={embeddedSchema}
      schemaLoading={schemaLoading}
      appendSchemaIfMissing={appendSchemaIfMissing}
      schemaEnabled={schemaEnabled}
      inlinePictograms={inlinePictograms}
    />
  );
}

export { cleanAdaptationContent } from "@/lib/adaptations/clean-adaptation-content";
