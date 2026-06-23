"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdaptationRenderer } from "@/components/adaptations/AdaptationRenderer";
import { AdaptationProfileSummary } from "@/features/adaptations/components/adaptation-profile-summary";
import { AdaptationExportButton } from "@/features/adaptations/components/adaptation-export-button";
import { SchemaExportRenderer } from "@/features/adaptations/components/schema-export-renderer";
import { DocumentSourceLinkCard } from "@/features/adaptations/components/document-source-link-card";
import { FalcScoreBadge } from "@/features/falc/components/falc-score-badge";
import { FalcPictogramsPanel } from "@/features/falc/components/falc-pictograms-panel";
import { useFalcPictograms } from "@/features/falc/hooks/use-falc-pictograms";
import { SchemaPanel } from "@/features/mindmaps/components/schema-panel";
import { useAdaptationSchema } from "@/features/mindmaps/hooks/use-adaptation-schema";
import { getProfileName } from "@/lib/constants/profiles";
import type { Adaptation } from "@/types";
import type { MermaidGenerationResult } from "@/types/mindmap";

interface AdaptationResultProps {
  adaptation: Adaptation;
  profileName?: string;
  documentTitle?: string;
}

export function AdaptationResult({
  adaptation,
  profileName,
  documentTitle,
}: AdaptationResultProps) {
  const [activeTab, setActiveTab] = useState("resume");
  const schemaEnabled = activeTab === "resume" || activeTab === "schema";
  const schemaState = useAdaptationSchema(
    adaptation.id,
    adaptation.mindmap_mermaid,
    schemaEnabled,
  );

  const isFalc = adaptation.adaptation_level === "falc";
  const courseContent = isFalc && adaptation.falc_content
    ? adaptation.falc_content
    : adaptation.adapted_content;
  const pictogramsEnabled = Boolean(adaptation.generate_pictograms);
  const pictogramsState = useFalcPictograms(
    adaptation.id,
    adaptation.falc_pictograms,
    pictogramsEnabled,
  );
  const inlinePictograms =
    isFalc && pictogramsEnabled ? pictogramsState.data?.items ?? [] : null;

  return (
    <div className="space-y-6">
      <AdaptationMeta
        adaptation={adaptation}
        profileName={profileName}
        documentTitle={documentTitle}
      />

      <AdaptationProfileSummary
        adaptation={adaptation}
        profileName={profileName}
        documentTitle={documentTitle}
      />

      <SchemaExportRenderer
        mermaidCode={schemaState.result?.mermaidCode}
        rootLabel={schemaState.result?.title}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isFalc && adaptation.falc_score != null && (
          <FalcScoreBadge score={adaptation.falc_score} />
        )}
        <AdaptationExportButton
          adaptationId={adaptation.id}
          adaptationLevel={adaptation.adaptation_level}
          schema={schemaState.result}
          ensureSchemaLoaded={async () => {
            if (schemaState.result?.mermaidCode?.trim()) {
              return schemaState.result.mermaidCode;
            }
            const loaded = await schemaState.loadDiagram(false);
            return loaded?.mermaidCode?.trim() ?? null;
          }}
          className={isFalc && adaptation.falc_score != null ? "" : "sm:ml-auto"}
        />
      </div>

      <FalcPictogramsPanel
        enabled={pictogramsEnabled}
        compact
        state={pictogramsState}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid w-full h-auto gap-1 ${
            adaptation.generate_pictograms
              ? isFalc
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
              : isFalc
                ? "grid-cols-1"
                : "grid-cols-2"
          }`}
          aria-label="Sections de l'adaptation"
        >
          <TabsTrigger value="resume" className="min-h-[44px]">Résumé</TabsTrigger>
          {!isFalc && (
            <TabsTrigger value="schema" className="min-h-[44px]">Schéma</TabsTrigger>
          )}
          {adaptation.generate_pictograms && (
            <TabsTrigger value="pictogrammes" className="min-h-[44px]">Pictogrammes</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="resume" className="space-y-4 mt-4">
          <DocumentSourceLinkCard
            documentId={adaptation.document_id}
            documentTitle={documentTitle}
          />
          <ResultCard
            title={isFalc ? "Cours adapté (FALC)" : "Cours adapté"}
            content={courseContent}
            embeddedSchema={schemaState.result}
            schemaLoading={schemaState.loading}
            schemaEnabled={activeTab === "resume"}
            appendSchemaIfMissing={isFalc}
            readingMode={isFalc ? "falc" : undefined}
            inlinePictograms={inlinePictograms}
          />
        </TabsContent>

        {!isFalc && (
          <TabsContent value="schema" className="mt-4" forceMount>
            <SchemaPanel
              adaptationId={adaptation.id}
              initialMermaid={adaptation.mindmap_mermaid}
              active={activeTab === "schema"}
              schemaState={schemaState}
            />
          </TabsContent>
        )}

        {adaptation.generate_pictograms && (
          <TabsContent value="pictogrammes" className="mt-4">
            <FalcPictogramsPanel enabled state={pictogramsState} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function AdaptationMeta({
  adaptation,
  profileName,
  documentTitle,
}: {
  adaptation: Adaptation;
  profileName?: string;
  documentTitle?: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {adaptation.is_demo && <Badge variant="outline">Mode démo</Badge>}
        {adaptation.adaptation_level === "falc" && (
          <Badge variant="accent">FALC</Badge>
        )}
        {adaptation.adaptation_level === "simplified" && (
          <Badge variant="secondary">Simplifié</Badge>
        )}
        {adaptation.profile_slugs.map((slug) => (
          <Badge key={slug}>{getProfileName(slug)}</Badge>
        ))}
        {adaptation.processing_time_ms && (
          <span className="text-base text-slate-500">
            Généré en {(adaptation.processing_time_ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      {(profileName || documentTitle) && (
        <p className="text-base text-slate-500">
          {profileName && <>Profil : <strong>{profileName}</strong></>}
          {profileName && documentTitle && " · "}
          {documentTitle && <>Document : <strong>{documentTitle}</strong></>}
        </p>
      )}
    </>
  );
}

function ResultCard({
  title,
  content,
  onOpenSchema,
  embeddedSchema,
  schemaLoading,
  appendSchemaIfMissing,
  schemaEnabled,
  readingMode,
  inlinePictograms,
}: {
  title: string;
  content: string | null;
  onOpenSchema?: () => void;
  embeddedSchema?: MermaidGenerationResult | null;
  schemaLoading?: boolean;
  appendSchemaIfMissing?: boolean;
  schemaEnabled?: boolean;
  readingMode?: import("@/types/reading-mode").ReadingMode;
  inlinePictograms?: import("@/types/falc").FalcPictogramItem[] | null;
}) {
  if (!content) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AdaptationRenderer
          content={content}
          mode={readingMode}
          onOpenSchema={onOpenSchema}
          embeddedSchema={embeddedSchema}
          schemaLoading={schemaLoading}
          appendSchemaIfMissing={appendSchemaIfMissing}
          schemaEnabled={schemaEnabled}
          inlinePictograms={inlinePictograms}
        />
      </CardContent>
    </Card>
  );
}
