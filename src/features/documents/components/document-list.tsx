import { FileText, FileType2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { Document } from "@/types";

interface DocumentListProps {
  documents: Document[];
}

const STATUS_LABELS: Record<Document["status"], { label: string; variant: "success" | "warning" | "outline" }> = {
  ready: { label: "Prêt", variant: "success" },
  processing: { label: "En cours", variant: "warning" },
  pending: { label: "En attente", variant: "outline" },
  error: { label: "Erreur", variant: "outline" },
};

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">Aucun document importé.</p>
          <p className="text-sm text-slate-400 mt-1">
            Importez un cours pour commencer une adaptation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const status = STATUS_LABELS[doc.status];
        return (
          <Card key={doc.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                <FileType2 className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-sm text-slate-500">
                  {doc.file_name} · {formatFileSize(doc.file_size)}
                  {doc.page_count ? ` · ${doc.page_count} pages` : ""}
                </p>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className="text-xs text-slate-400 shrink-0">
                {formatDate(doc.created_at)}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
