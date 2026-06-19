import { FileText, FileType2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatFileSize, cn } from "@/lib/utils";
import type { Document } from "@/types";

interface DocumentListProps {
  documents: Document[];
  highlightId?: string;
}

const STATUS_LABELS: Record<Document["status"], { label: string; variant: "success" | "warning" | "outline" }> = {
  ready: { label: "Prêt", variant: "success" },
  processing: { label: "En cours", variant: "warning" },
  pending: { label: "En attente", variant: "outline" },
  error: { label: "Erreur", variant: "outline" },
};

export function DocumentList({ documents, highlightId }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center px-4">
          <FileText className="h-12 w-12 text-slate-300 mb-4" aria-hidden />
          <p className="text-base text-slate-500">Aucun document importé.</p>
          <p className="text-base text-slate-400 mt-1">
            Importez un cours pour commencer une adaptation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {documents.map((doc) => (
          <DocumentMobileCard key={doc.id} doc={doc} highlighted={doc.id === highlightId} />
        ))}
      </div>

      {/* Desktop: tableau */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-base">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold">Document</th>
              <th className="px-4 py-3 font-semibold">Format</th>
              <th className="px-4 py-3 font-semibold">Taille</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const status = STATUS_LABELS[doc.status];
              return (
                <tr
                  key={doc.id}
                  id={doc.id === highlightId ? "document-highlight" : undefined}
                  className={cn(
                    "border-b border-slate-100 last:border-0 hover:bg-slate-50/50",
                    doc.id === highlightId && "bg-primary/5 ring-2 ring-inset ring-primary/30",
                  )}
                >
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 uppercase text-slate-600">{doc.file_type}</td>
                  <td className="px-4 py-3 text-slate-600">{formatFileSize(doc.file_size)}</td>
                  <td className="px-4 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(doc.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DocumentMobileCard({
  doc,
  highlighted = false,
}: {
  doc: Document;
  highlighted?: boolean;
}) {
  const status = STATUS_LABELS[doc.status];
  return (
    <Card
      id={highlighted ? "document-highlight" : undefined}
      className={cn(highlighted && "ring-2 ring-primary/40")}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <FileType2 className="h-5 w-5 text-secondary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-base truncate">{doc.title}</p>
            <p className="text-base text-slate-500">{formatFileSize(doc.file_size)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status.variant}>{status.label}</Badge>
          <span className="text-base text-slate-500">{formatDate(doc.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
