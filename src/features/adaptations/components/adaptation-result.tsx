"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AdaptationProfileSummary } from "@/features/adaptations/components/adaptation-profile-summary";
import { AdaptationExportButton } from "@/features/adaptations/components/adaptation-export-button";
import {
  AdaptationDeleteButton,
  AdaptationRegenerateButton,
} from "@/features/adaptations/components/adaptation-actions";
import { AdaptationPdfViewer } from "@/features/adaptations/components/adaptation-pdf-viewer";
import { DocumentSourceLinkCard } from "@/features/adaptations/components/document-source-link-card";
import { FalcScoreBadge } from "@/features/falc/components/falc-score-badge";
import { getProfileName } from "@/lib/constants/profiles";
import type { Adaptation } from "@/types";

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
  const isFalc = adaptation.adaptation_level === "falc";
  const [pdfReloadToken, setPdfReloadToken] = useState(0);

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isFalc && adaptation.falc_score != null && (
          <FalcScoreBadge score={adaptation.falc_score} />
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:ml-auto">
          <AdaptationRegenerateButton
            adaptationId={adaptation.id}
            adaptationTitle={documentTitle ?? "Adaptation"}
            onRegenerated={() => setPdfReloadToken((token) => token + 1)}
          />
          <AdaptationExportButton adaptationId={adaptation.id} />
          <AdaptationDeleteButton
            adaptationId={adaptation.id}
            adaptationTitle={documentTitle ?? "Adaptation"}
          />
        </div>
      </div>

      <AdaptationPdfViewer adaptationId={adaptation.id} reloadToken={pdfReloadToken} />

      <DocumentSourceLinkCard
        documentId={adaptation.document_id}
        documentTitle={documentTitle}
      />
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
