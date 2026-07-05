import Link from "next/link";
import { ArrowLeft, Download, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DocumentDeleteButton,
} from "@/features/documents/components/document-actions";
import { formatDate, formatFileSize } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Document } from "@/types";

interface DocumentDetailProps {
  document: Document;
  adaptationsCount: number;
}

const STATUS_LABELS: Record<Document["status"], { label: string; variant: "success" | "warning" | "outline" }> = {
  ready: { label: "Prêt", variant: "success" },
  processing: { label: "En cours", variant: "warning" },
  pending: { label: "En attente", variant: "outline" },
  error: { label: "Erreur", variant: "outline" },
};

export function DocumentDetail({ document, adaptationsCount }: DocumentDetailProps) {
  const status = STATUS_LABELS[document.status];
  const canDownloadFile = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <Link
        href="/documents"
        className="inline-flex min-h-[44px] items-center gap-2 text-base text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour aux documents
      </Link>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl break-words">{document.title}</CardTitle>
                <p className="mt-1 text-base text-slate-500 break-all">{document.file_name}</p>
              </div>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-slate-500">Format</dt>
              <dd className="text-base font-medium uppercase">{document.file_type}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Taille</dt>
              <dd className="text-base font-medium">{formatFileSize(document.file_size)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Pages</dt>
              <dd className="text-base font-medium">
                {document.page_count ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Importé le</dt>
              <dd className="text-base font-medium">{formatDate(document.created_at)}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {canDownloadFile ? (
              <Button asChild className="w-full sm:w-auto">
                <a
                  href={`/api/documents/${document.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  {document.file_type === "pdf" ? "Ouvrir le PDF" : "Télécharger le fichier"}
                </a>
              </Button>
            ) : (
              <p className="text-base text-slate-500">
                Téléchargement du fichier original indisponible en mode démo.
              </p>
            )}

            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/adaptations/new?documentId=${document.id}`}>
                <Sparkles className="h-4 w-4" />
                Adapter ce document
              </Link>
            </Button>

            <DocumentDeleteButton
              documentId={document.id}
              documentTitle={document.title}
              adaptationsCount={adaptationsCount}
            />
          </div>

          {adaptationsCount > 0 && (
            <p className="text-base text-slate-500">
              {adaptationsCount} adaptation{adaptationsCount > 1 ? "s" : ""} liée
              {adaptationsCount > 1 ? "s" : ""} à ce document.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Texte extrait</CardTitle>
        </CardHeader>
        <CardContent>
          {document.extracted_text ? (
            <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-800">
                {document.extracted_text}
              </p>
            </div>
          ) : (
            <p className="text-base text-slate-500">
              {document.status === "error"
                ? "Le texte n'a pas pu être extrait de ce document."
                : "Aucun texte extrait disponible."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
